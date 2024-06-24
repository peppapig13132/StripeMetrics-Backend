# STRIPE DASHBOARD (Backend)

## Features

- [x] MRR
- [x] Subscribers
- [x] MRR Movements
- [x] Average Staying
- [x] Customer Lifetime Value
- [x] Customer Churn Rate
- [x] Free to paid subscriptions
- [x] Free trials
- [x] Annual Run Rate


## Deployment

### Prerequisites

- Node.js v20.12.2 (LTS)
- npm v10.6.0
- Git
- PostgreSQL v16.2
- [Frontend](https://github.com/peppapig13132/Stripe-Dashboard-Frontend)


### Steps

1. Clone the repository from GitHub

    ```
    git clone https://github.com/peppapig13132/Stripe-Dashboard-Backend.git
    cd Stripe-Dashboard-Backend
    ```

2. Install Dependencies

    Install the necessary dependencies for Backend - Express.js project.
    ```
    npm install
    ```

3. Set Environment variables

    Replace filename `.env.example` to `.env`.
    ```
    # This variable used for JWT
    SECRETKEY=
    ```

4. Prepare Frontend Codes

    Move Compiled Frontend Codes into `static` directory.

5. Run Development mode

    Running without hotload
    ```
    npm start
    ```

    Running with hotload (Used nodemon)
    ```
    npm run dev
    ```

6. Run Production mode

    Build the code: This command will create `dist` directory in the project folder.
    ```
    npm run build
    ```
    ```
    cd dist
    npm start
    ```

7. Synchronize Database

    Use environment variable `DB_SYNC` to synchronize database.
    ```
    # Synchronize database
    DB_SYNC=true

    # Ignore synchronization
    DB_SYNC=false
    ```
    To synchronize a specific model, find `src/db.ts`
    

## Calculation

### Customer Lifetime Value

- **ARPU** (Average Monthly Revenue Per User)
  ```
  ARPU = Total Monthly Revenue / Number of Active Customers
  ```

- **Monthly Churn Rate**
  ```
  Monthly Churn Rate = Number of Customers Lost in a Month / Number of Customers at the Start of the Month
  ```

- **Customer Lifetime**
  ```
  Customer Lifetime = 1 / Monthly Churn Rate
  ```

- **CLV** (Customer Lifetime Value)
  ```
  CLV = ARPU * Customer Lifetime
  ```


### Customer Churn Rate

- **Customer Churn Rate**
  ```
  Churn Rate = (Number of Canceled Subscriptions / Number of Active Subscriptions at the Start) * 100
  ```

### Annual Run Rate

- **Annual Run Rate**

  Be sure, Annual Run Rate calcualted by following formular as the provider has only monthly subscriptions.
  ```
  Annual Run Rate = MRR * 12
  ```


## Deploy Node.js application on cPanel
- Modify your `.htaccess` file in the domain root directory.
    ```
    # If your server running on port 8000
    RewriteEngine on
    RewriteRule ^(.*)$ http://127.0.0.1:8000/$1 [P]
    ```
- Use `pm2` module. More about `pm2`, click [here](https://pm2.keymetrics.io/).
    ```
    # Start process
    pm2 start <ENTRY_JS_FILE>
    
    # Check process
    pm2 list

    # Stop process
    pm2 delete <id>
    ```

## Logic Verification

- [ ] MRR
- [x] Subscribers
- [ ] MRR Movements
- [ ] Average Staying
- [ ] Customer Lifetime Value
- [ ] Customer Churn Rate
- [ ] Free to paid subscriptions
- [ ] Free trials
- [ ] Annual Run Rate