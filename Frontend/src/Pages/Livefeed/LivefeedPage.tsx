import { Card, Row, Col } from "antd";
import styles from "./LivefeedPage.module.css";
import "../../global.css";

// TODO: Implement the Live Feed here. Connect to Backend/Cameras

const LivefeedPage = () => {
    return (
        <div className={styles.pageContainer}>
            <h1>Live Feed</h1>
            <Row gutter={16}>
                <Col span={24}>
                    <Card
                        title="Live Feed"
                        bordered={false}
                        className={styles.livefeedCard}
                    >
                        <div className={styles.livefeedContent}>
                            {/* Placeholder for live feed content */}
                            <p>Live feed content goes here...</p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LivefeedPage;
