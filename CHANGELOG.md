# Release Notes

**Release Date:** [21-Nov-2024]

## v.1.0.0

### Event Management

- Added endpoints for creating, reading, updating, and deleting events.

- Included pagination and sorting for fetching event lists.

- Enhanced validation for event fields to ensure data consistency.

### Booth Type Management

- Introduced endpoints to manage booth types (Create, Read, Update, Delete).

- Supported customizable booth attributes like dimensions, pricing, and availability.

### Booth Management

- Developed comprehensive endpoints for booth management:

  - **Create**: Add new booths with type, location, and event association.

  - **Read**: Retrieve booth details individually or in bulk.

  - **Update**: Modify booth properties such as price and availability.

  - **Delete**: Remove unused or outdated booths from the system.

- Integrated validation for booth capacity and uniqueness.

### Order Management

- **Order Creation**:

  - Implemented endpoint to create new booth orders.

  - Supported validation for booth availability before order confirmation.

- **Order Completion**:

  - Added endpoint to mark orders as completed with payment status updates.

  - Included transactional support to ensure data integrity.