import { EventEmitter } from 'events';

// Global event emitter for in-process event pushing
// In production this would be replaced with Kafka/RabbitMQ
export const eventEmitter = new EventEmitter();

// Max listeners to avoid memory leak warnings
eventEmitter.setMaxListeners(100);

export default eventEmitter;
