/**
 * Copyright (C) 2024 Axis Communications AB, Lund, Sweden
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     <http://www.apache.org/licenses/LICENSE-2.0>
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This example creates a Metadata Broker subscriber for the
 * analytics_scene_description topic. Streamed messages are received in the
 * Analytics Data Format (ADF) and is logged to syslog.
 */

#include <signal.h>
#include <stdio.h>
#include <string.h>
#include <sys/syslog.h>
#include <syslog.h>
#include <time.h>
#include <unistd.h>

#include <mdb/connection.h>
#include <mdb/error.h>
#include <mdb/subscriber.h>

#include <jansson.h>
#include <stdlib.h>
#include <curl/curl.h>

void send_json_to_server(const char *json_str);

typedef struct channel_identifier {
    char* topic;
    char* source;
} channel_identifier_t;

static void on_connection_error(mdb_error_t* error, void* user_data) {
    (void)user_data;

    syslog(LOG_ERR, "Got connection error: %s, Aborting...", error->message);

    abort();
}


void send_json_to_server(const char *json_str) {
    CURL *curl = curl_easy_init();
    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "192.168.1.238:5001/acap-data");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_str);

        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        CURLcode res = curl_easy_perform(curl);
        if(res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }
}

static void on_message(const mdb_message_t* message, void* user_data) {
    const struct timespec* timestamp     = mdb_message_get_timestamp(message);
    const mdb_message_payload_t* payload = mdb_message_get_payload(message);

    channel_identifier_t* channel_identifier = (channel_identifier_t*)user_data;


    //Calculate time since last send
    static struct timespec last_sent_timestamp = {0,0};
    //const long n_seconds = 1;
    time_t sec_diff = timestamp->tv_sec -last_sent_timestamp.tv_sec;
    long nsec_diff = timestamp->tv_nsec - last_sent_timestamp.tv_nsec;
    if (nsec_diff < 0) {
        sec_diff--;
        nsec_diff += 1000000000L;
    }


    //if (sec_diff >= n_seconds) {
    // Create JSON object
    json_t *json_obj = json_object();

    // Add topic and source
    json_object_set_new(json_obj, "topic", json_string(channel_identifier->topic));
    json_object_set_new(json_obj, "source", json_string(channel_identifier->source));

    //Add timestamp as a nested object
    // json_t *timestamp_obj = json_object();
    // json_object_set_new(timestamp_obj, "seconds", json_integer((long long)timestamp->tv_sec));
    // json_object_set_new(timestamp_obj, "nanoseconds", json_integer(timestamp->tv_nsec));
    // json_object_set_new(json_obj, "timestamp", timestamp_obj);

    // Add payload data (assuming it's a string for now)

    json_object_set_new(json_obj, "data", json_stringn((char*)payload->data, payload->size));
   // syslog(LOG_INFO, "%.*s", (int)payload->size, (char*)payload->data);

    // Convert JSON object to string
    char *json_str = json_dumps(json_obj, 0);

    // Send JSON to the server
 
    send_json_to_server(json_str);
    //syslog(LOG_INFO, "Data sent");


    // Free memory
    json_decref(json_obj);
    free(json_str);
    last_sent_timestamp = *timestamp;
   // }
}

static void on_done_subscriber_create(const mdb_error_t* error, void* user_data) {
    if (error != NULL) {
        syslog(LOG_ERR, "Got subscription error: %s, Aborting...", error->message);
        abort();
    }
    channel_identifier_t* channel_identifier = (channel_identifier_t*)user_data;

    syslog(LOG_INFO,
           "Subscribed to %s (%s)...",
           channel_identifier->topic,
           channel_identifier->source);
}

static void sig_handler(int signum) {
    (void)signum;
    // Do nothing, just let pause in main return.
}

int main(int argc, char** argv) {
    (void)argc;
    (void)argv;
    syslog(LOG_INFO, "Subscriber started...");

    // For com.axis.analytics_scene_description.v0.beta source corresponds to the
    // video channel number.
    channel_identifier_t channel_identifier    = {.topic =
                                                      "com.axis.consolidated_track.v1.beta",
                                                  .source = "1"};
    mdb_error_t* error                         = NULL;
    mdb_subscriber_config_t* subscriber_config = NULL;
    mdb_subscriber_t* subscriber               = NULL;

    mdb_connection_t* connection = mdb_connection_create(on_connection_error, NULL, &error);
    if (error != NULL) {
        goto end;
    }

    subscriber_config = mdb_subscriber_config_create(channel_identifier.topic,
                                                     channel_identifier.source,
                                                     on_message,
                                                     &channel_identifier,
                                                     &error);
    if (error != NULL) {
        goto end;
    }

    subscriber = mdb_subscriber_create_async(connection,
                                             subscriber_config,
                                             on_done_subscriber_create,
                                             &channel_identifier,
                                             &error);
    if (error != NULL) {
        goto end;
    }

    // Add signal handler to allow for cleanup on ordered termination.
    (void)signal(SIGTERM, sig_handler);

    pause();

end:
    if (error != NULL) {
        syslog(LOG_ERR, "%s", error->message);
    }

    mdb_error_destroy(&error);
    mdb_subscriber_config_destroy(&subscriber_config);
    mdb_subscriber_destroy(&subscriber);
    mdb_connection_destroy(&connection);

    syslog(LOG_INFO, "Subscriber closed...");

    return 0;
}
