# ERP System

An Enterprise Resource Planning (ERP) system built with Spring Boot backend and React frontend.

## Overview

This system is a comprehensive ERP application for managing business operations including user management, customer management, product catalog, address management, and order processing with multi-step workflows. The backend is built with Spring Boot and the frontend is built with React using a styled-components UI library. Data is managed using a JSON file-based database.

## System Architecture

### Backend (Spring Boot)

- **Framework**: Spring Boot 3.4.0
- **Database**: File-based JSONDB (migrated from H2)
- **Build Tool**: Gradle
- **Java Version**: 17+

#### Main Components

- **Entities**: User, Customer, Product, Address, Order, OrderItem
- **Controllers**: UserController, CustomerController, ProductController, AddressController, OrderController
- **Services**: Business logic for all entities
- **Repositories**: Data access layer for all entities
- **JsonDbConfig**: Configuration for JSON database
- **WebSocket Support**: Real-time communication capabilities

#### Data Structures

**User:**
```json
{
  "id": "1",
  "firstName": "Taro",
  "lastName": "Tanaka",
  "email": "tanaka@example.com",
  "userType": "ADMIN",
  "status": "ACTIVE",
  "balance": 0.0,
  "createdAt": "2024-01-01T00:00:00"
}
```

**Customer:**
```json
{
  "id": "1",
  "name": "ABC Corporation",
  "email": "contact@abc.com",
  "phone": "03-1234-5678",
  "status": "ACTIVE"
}
```

**Product:**
```json
{
  "id": "1",
  "name": "Product Name",
  "description": "Product description",
  "price": 1000.00,
  "stock": 100,
  "status": "ACTIVE"
}
```

**Order:**
```json
{
  "id": "ORD-001",
  "customerId": "1",
  "orderDate": "2024-01-01",
  "status": "DRAFT",
  "totalAmount": 5000.00,
  "items": [
    {
      "productId": "1",
      "quantity": 5,
      "unitPrice": 1000.00,
      "subtotal": 5000.00
    }
  ]
}
```

### Frontend (React)

- **Framework**: React 18.2.0
- **UI Library**: Styled Components with CSS Variables
- **Build Tool**: Vite 5.0.0
- **Package Manager**: pnpm (workspace)
- **TypeScript**: 5.0.0
- **Monorepo**: Nx 22.0.3

#### Applications

- **my-app**: Main production ERP application with:
  - User authentication and management
  - Master data management (Users, Customers, Products, Addresses)
  - Order management with multi-step workflow (Entry, Approval, Confirmation, Shipping, Invoicing, Payment, History)
  - Internationalization (English/Japanese)
  - WebSocket integration for real-time updates
- **my-dev**: Development/demo application showcasing all UI components
- **my-electron**: Electron desktop application wrapper

#### UI Component Library

The frontend includes a comprehensive styled-components UI library with:
- **Design Tokens**: CSS variables for consistent theming
- **Dark Mode**: Built-in light/dark theme support
- **Components**: Button, Card, Input, Table, Chart, Dialog, Checkbox, Radio, DateRangePicker, Progress, Listbox, and more
- **Layout Components**: Container, Header, Grid, Section
- **Typography**: Title, Subtitle, Heading, Paragraph, Label

See [client/README.md](client/README.md) for detailed component documentation.

## Setup and Execution

### Initial Data Reset

To reset all data to initial state (useful for development/testing):

```bash
cd server
./reset-data.sh
```

This script will:
- Reset all data files to empty arrays `[]`
- Reset all counters to their initial values
- Optionally create a backup before resetting

For detailed information, see [RESET_DATA_README.md](RESET_DATA_README.md).

---

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- pnpm (install with `npm install -g pnpm`)

### Starting the Backend

```bash
# From the project root directory
./gradlew bootRun
```

The backend will start at `http://localhost:8080`.

### Starting the Frontend

```bash
# From the client directory
cd client
pnpm install

# Start the main application
pnpm dev:my-app

# Or start the demo application
pnpm dev:my-dev

# Or start with Electron
pnpm app
```

The frontend applications will start on their respective ports (typically Vite default port, usually `http://localhost:5173`).

**Note**: For detailed frontend setup and development instructions, see [client/README.md](client/README.md).

## API Specification

### Base URLs
```
http://localhost:8080/api/users
http://localhost:8080/api/customers
http://localhost:8080/api/products
http://localhost:8080/api/addresses
http://localhost:8080/api/orders
```

### User Endpoints

#### Get User List
```
GET /api/users
```

#### Create User
```
POST /api/users
```

#### Update User
```
PUT /api/users/{id}
```

#### Delete User
```
DELETE /api/users/{id}
```

#### Get User by ID
```
GET /api/users/{id}
```

#### Login
```
POST /api/users/login
```

### Customer Endpoints

#### Get Customer List
```
GET /api/customers
```

#### Create Customer
```
POST /api/customers
```

#### Update Customer
```
PUT /api/customers/{id}
```

#### Delete Customer
```
DELETE /api/customers/{id}
```

#### Get Customer by ID
```
GET /api/customers/{id}
```

### Product Endpoints

#### Get Product List
```
GET /api/products
```

#### Create Product
```
POST /api/products
```

#### Update Product
```
PUT /api/products/{id}
```

#### Delete Product
```
DELETE /api/products/{id}
```

#### Get Product by ID
```
GET /api/products/{id}
```

### Address Endpoints

#### Get Address List
```
GET /api/addresses
```

#### Create Address
```
POST /api/addresses
```

#### Update Address
```
PUT /api/addresses/{id}
```

#### Delete Address
```
DELETE /api/addresses/{id}
```

#### Get Address by ID
```
GET /api/addresses/{id}
```

### Order Endpoints

#### Get Order List
```
GET /api/orders
```

#### Create Order
```
POST /api/orders
```

#### Update Order
```
PUT /api/orders/{id}
```

#### Delete Order
```
DELETE /api/orders/{id}
```

#### Get Order by ID
```
GET /api/orders/{id}
```

#### Update Order Status
```
PUT /api/orders/{id}/status
```

### Status Endpoint

#### Check Status
```
GET /api/status
```

## Database

### JSONDB Files

- **User Data**: `data/users.json`
- **Customer Data**: `data/customers.json`
- **Product Data**: `data/products.json`
- **Address Data**: `data/addresses.json`
- **Order Data**: `data/orders.json`
- **Order Counter**: `data/order_counter.json`
- **Auto Save**: Configurable (`jsondb.auto.save=true`)

### Data Persistence

- Load data from respective JSON files when application starts
- If files don't exist, initialize with empty arrays
- Automatically save to respective JSON files when data changes
- Order counter is maintained separately for generating unique order IDs

## Configuration

### Application Configuration (`application.properties`)

```properties
# Application Name
spring.application.name=edge

# JSONDB Configuration
jsondb.file.path=./data/users.json
jsondb.auto.save=true

# Character Encoding
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true
server.servlet.encoding.enabled=true

# Server Port
server.port=8080

# Logging
logging.level.com.edge=DEBUG
```

## Features

### User Management

- ✅ User authentication (login/logout)
- ✅ User list display
- ✅ User addition
- ✅ User editing
- ✅ User deletion
- ✅ Initial setup for first user
- ✅ User type and status management

### Master Data Management

- ✅ **Customer Management**: Create, read, update, delete customers
- ✅ **Product Management**: Manage product catalog with pricing and stock
- ✅ **Address Management**: Store and manage customer addresses
- ✅ **User Management**: System user administration

### Order Management

- ✅ **Order Entry**: Create and edit orders with multiple items
- ✅ **Order Workflow**: Multi-step order processing
  - Draft → Approval → Confirmation → Shipping Instructions → Shipping → Invoicing → Payment → History
- ✅ **Order Listing**: View and search all orders
- ✅ **Order Status Tracking**: Real-time status updates
- ✅ **Order Items**: Manage multiple products per order

### Data Validation

- Email address duplication check
- Required field validation
- Order status workflow validation
- Data integrity checks

### Internationalization Support

- Complete Japanese character support
- UTF-8 encoding
- Beautiful Japanese display with **Google Noto Sans JP font**
- Japanese text optimization (line spacing, character spacing adjustment)
- English and Japanese language support in frontend

### UI/UX Improvements

- **Component Library**: Comprehensive React component library with styled-components
- **Design System**: CSS variables and design tokens for consistent theming
- **Dark Mode**: Built-in light/dark theme support
- **Responsive**: Mobile and tablet support
- **Animation**: Smooth hover effects and transitions
- **Color Palette**: Unified color scheme design
- **Typography**: Consistent typography system
- **Internationalization**: i18n support (English/Japanese)
- **WebSocket**: Real-time updates and notifications
- **Multi-step Workflows**: Intuitive order processing interface

## Developer Information

### Reference Documentation
For further reference, please consider the following sections:

* [Official Gradle documentation](https://docs.gradle.org)
* [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/3.4.0/gradle-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.4.0/gradle-plugin/packaging-oci-image.html)

### Additional Links
These additional references should also help you:

* [Gradle Build Scans – insights for your project's build](https://scans.gradle.com#gradle)

### Project Structure

```
app-erp/
├── server/              # Spring Boot backend
│   ├── src/main/java/com/edge/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST API controllers
│   │   │   ├── UserController.java
│   │   │   ├── CustomerController.java
│   │   │   ├── ProductController.java
│   │   │   ├── AddressController.java
│   │   │   └── OrderController.java
│   │   ├── entity/          # Entity classes
│   │   │   ├── User.java
│   │   │   ├── Customer.java
│   │   │   ├── Product.java
│   │   │   ├── Address.java
│   │   │   ├── Order.java
│   │   │   └── OrderItem.java
│   │   ├── repository/      # Data repositories
│   │   ├── service/         # Business logic
│   │   └── EdgeApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── data/                # JSONDB data files
│   │   ├── users.json
│   │   ├── customers.json
│   │   ├── products.json
│   │   ├── addresses.json
│   │   ├── orders.json
│   │   └── order_counter.json
│   ├── build.gradle         # Gradle configuration
│   ├── start-apps.sh        # Startup script
│   └── README.md
└── client/              # React frontend monorepo
    ├── apps/
    │   ├── my-app/      # Main ERP application
    │   ├── my-dev/      # Demo/development app
    │   └── my-electron/ # Electron desktop app
    ├── libs/
    │   └── ui/          # UI component library
    ├── package.json
    ├── pnpm-workspace.yaml
    └── README.md        # Frontend documentation
```

### Log Output

The application outputs detailed logs providing the following information:

- File read/save status
- Database operation details
- Error details
- Performance information

### Troubleshooting

#### Common Issues

1. **Port 8080 is in use**
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. **Data file cannot be loaded**
   - Check existence of `data/users.json`
   - Check file permissions
   - Check JSON format syntax

3. **Japanese character garbling**
   - Check editor character encoding settings
   - Check application UTF-8 configuration

4. **IDE Restart Issues (Resource Loading Errors)**
   
   If you experience 404 resource loading errors after IDE restart:
   
   **Quick Fix:**
   ```bash
   # Use the startup script (update paths in script if needed)
   ./start-apps.sh
   ```
   
   **Manual Fix:**
   ```bash
   # Clean Vite cache and restart
   cd client
   pnpm clean
   pnpm dev:my-app
   ```
   
   **Alternative:**
   ```bash
   # Clean everything and restart
   cd client
   rm -rf node_modules/.vite dist
   pnpm install
   pnpm dev:my-app
   ```

5. **Vite Dependency Optimization Errors**
   
   If you see "chunk-XXXXX.js not found" errors:
   ```bash
   cd client
   rm -rf node_modules/.vite dist
   pnpm install
   pnpm dev:my-app
   ```

6. **pnpm Not Found**
   
   If pnpm is not installed:
   ```bash
   npm install -g pnpm
   ```

## License

This project is published under the MIT License.

## Contributing

Please report bugs and feature requests through GitHub Issues.

## Update History

- v1.0.0: Initial release (User Management System)
- v1.1.0: Migration from H2 to JSONDB
- v1.2.0: Improved Japanese support
- v1.3.0: Enhanced error handling
- v2.0.0: Migration from Angular to React with styled-components UI library
- v2.1.0: Added Customer, Product, and Address management
- v2.2.0: Added Order management with multi-step workflow
- v2.3.0: Added WebSocket support and internationalization
