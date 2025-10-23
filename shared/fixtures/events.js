/**
 * Event Test Fixtures
 * Provides reusable event/message test data for AWS EventBridge pattern
 */

/**
 * Generate unique event ID
 */
export function generateEventId() {
  return `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate correlation ID
 */
export function generateCorrelationId() {
  return `corr-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create AWS EventBridge message
 */
export function createEventBridgeMessage(eventType, data, overrides = {}) {
  return {
    source: 'test-service',
    eventType,
    eventVersion: 'v1',
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId(),
    data,
    metadata: {
      userId: 'test-user-123',
      environment: 'test',
    },
    ...overrides,
  };
}

/**
 * User created event
 */
export function createUserCreatedEvent(userId, userEmail) {
  return createEventBridgeMessage('user.created', {
    userId,
    email: userEmail,
    firstName: 'Test',
    lastName: 'User',
  });
}

/**
 * User updated event
 */
export function createUserUpdatedEvent(userId, updates) {
  return createEventBridgeMessage('user.updated', {
    userId,
    updates,
  });
}

/**
 * User deleted event
 */
export function createUserDeletedEvent(userId) {
  return createEventBridgeMessage('user.deleted', {
    userId,
  });
}

/**
 * Order created event
 */
export function createOrderCreatedEvent(orderId, customerId, totalAmount) {
  return createEventBridgeMessage('order.created', {
    orderId,
    customerId,
    totalAmount,
    status: 'pending',
  });
}

/**
 * Order completed event
 */
export function createOrderCompletedEvent(orderId) {
  return createEventBridgeMessage('order.completed', {
    orderId,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

/**
 * Payment processed event
 */
export function createPaymentProcessedEvent(paymentId, orderId, amount) {
  return createEventBridgeMessage('payment.processed', {
    paymentId,
    orderId,
    amount,
    status: 'success',
  });
}

/**
 * Notification sent event
 */
export function createNotificationSentEvent(notificationId, userId, type) {
  return createEventBridgeMessage('notification.sent', {
    notificationId,
    userId,
    type,
    sentAt: new Date().toISOString(),
  });
}

/**
 * Invalid event (missing required fields)
 */
export function createInvalidEvent() {
  return {
    // Missing source
    eventType: 'test.invalid',
    // Missing eventVersion, eventId, data
  };
}

export default {
  generateEventId,
  generateCorrelationId,
  createEventBridgeMessage,
  createUserCreatedEvent,
  createUserUpdatedEvent,
  createUserDeletedEvent,
  createOrderCreatedEvent,
  createOrderCompletedEvent,
  createPaymentProcessedEvent,
  createNotificationSentEvent,
  createInvalidEvent,
};
