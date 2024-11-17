/**
 * @constant {number} #MAX_PER_ORDER
 * A private, readonly constant that defines the maximum number of products allowed per order.
 *
 * This value is used to ensure that no order exceeds a predefined limit of products,
 * which in this case is set to 20. The system will throw a validation error if
 * the products array in the request body contains more than 20 items.
 *
 */
export const MAX_PER_ORDER = 1;

/**
 * @constant {number} #MAX_QUANTITY
 * A private, readonly constant that defines the maximum quantity allowed for each product.
 *
 * This value is used to ensure that no product exceeds a predefined quantity limit,
 * which in this case is set to 30. The system will throw a validation error if
 * any product's quantity exceeds this limit.
 *
 */
export const MAX_QUANTITY = 1;
