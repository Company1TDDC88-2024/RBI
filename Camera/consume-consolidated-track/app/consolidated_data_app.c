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
#include <jansson.h>
#include <curl/curl.h>

#include <mdb/connection.h>
#include <mdb/error.h>
#include <mdb/subscriber.h>

typedef struct channel_identifier {
    char* topic;
    char* source;
} channel_identifier_t;

void send_json_to_server(const char *json_str);

static void on_connection_error(mdb_error_t* error, void* user_data) {
    (void)user_data;

    syslog(LOG_ERR, "Got connection error: %s, Aborting...", error->message);

    abort();
}

void send_json_to_server(const char *json_str) {
    CURL *curl = curl_easy_init();

    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "192.168.1.238:5001/acap-data");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_str);

        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        CURLcode res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            syslog(LOG_INFO, "cURL error");
        }

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }
}

static void send_accumulated_detections(json_t *accumulated_detections) {
    if (json_array_size(accumulated_detections) > 0) {
        char *json_str = json_dumps(accumulated_detections, 0);
        
        send_json_to_server(json_str);
        free(json_str);
        json_array_clear(accumulated_detections);
    }
}

static void process_human_detections(const char* payload_data, size_t size) {
    json_t* root = json_loadb(payload_data, size, 0, NULL);
    json_t* classes = json_object_get(root, "classes");
    json_t* observations = json_object_get(root, "observations");
    const char* id = json_string_value(json_object_get(root, "id"));
    const char* start_time = json_string_value(json_object_get(root, "start_time"));
    const char* end_time = json_string_value(json_object_get(root, "end_time"));
    
    json_t* accumulated_detections = json_array();

    size_t index;
    json_t* detection;
    json_array_foreach(observations, index, detection) {
        const char* type = json_string_value(json_object_get(classes, "type"));

        if (type && strcmp(type, "Human") == 0) {
            json_t* bounding_box = json_object_get(detection, "bounding_box");
            double bottom = json_number_value(json_object_get(bounding_box, "bottom"));
            double left = json_number_value(json_object_get(bounding_box, "left"));
            double right = json_number_value(json_object_get(bounding_box, "right"));
            double top = json_number_value(json_object_get(bounding_box, "top"));
            const char* timestamp = json_string_value(json_object_get(detection, "timestamp"));

            json_t* detection_obj = json_pack("{s:f, s:f, s:f, s:f, s:s}",
                                               "bottom", bottom,
                                               "left", left,
                                               "right", right,
                                               "top", top,
                                               "timestamp", timestamp);
            json_array_append_new(accumulated_detections, detection_obj);
        }
    }

    json_t* time_frame_obj = json_pack("{s:s, s:s, s:s, s:o}", 
                                        "id", id, 
                                        "start_time", start_time, 
                                        "end_time", end_time, 
                                        "observations", accumulated_detections);
    send_accumulated_detections(time_frame_obj);

    json_decref(accumulated_detections);
    json_decref(time_frame_obj); 
    json_decref(root); 
}

static void on_message(const mdb_message_t* message, void* user_data) {    
    const mdb_message_payload_t* payload = mdb_message_get_payload(message);
    channel_identifier_t* channel_identifier = (channel_identifier_t*)user_data;
    syslog(LOG_INFO,
           "Subscribed to %s (%s)...",
           channel_identifier->topic,
           channel_identifier->source);

    process_human_detections((const char*)payload->data, payload->size);
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
