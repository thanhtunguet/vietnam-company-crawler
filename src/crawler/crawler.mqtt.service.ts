// crawler.mqtt.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { MQTT_URL } from 'src/_config/dotenv';

@Injectable()
export class CrawlerMqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;

  private readonly MQTT_BROKER_URL = MQTT_URL; // Update if needed

  onModuleInit() {
    this.client = mqtt.connect(this.MQTT_BROKER_URL);

    this.client.on('connect', () => {
      console.log('[MQTT] Connected to broker');
      // Subscribe to job topic on connect
      this.client.subscribe('crawler/job/start', (err) => {
        if (err) {
          console.error('[MQTT] Subscription error:', err);
        } else {
          console.log('[MQTT] Subscribed to crawler/job/start');
        }
      });
    });

    this.client.on('error', (err) => {
      console.error('[MQTT] Error:', err.message);
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }

  // Publish to any topic
  publish(topic: string, payload: any) {
    const message = JSON.stringify(payload);
    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) console.error('[MQTT] Publish error:', err);
    });
  }

  // Subscribe to a topic with callback
  subscribe(topic: string, handler: (payload: any) => void) {
    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[MQTT] Failed to subscribe to ${topic}:`, err);
      }
    });

    this.client.on('message', (receivedTopic, messageBuffer) => {
      if (receivedTopic === topic) {
        try {
          const payload = JSON.parse(messageBuffer.toString());
          handler(payload);
        } catch (err) {
          console.error('[MQTT] Failed to parse message:', err);
        }
      }
    });
  }
}
