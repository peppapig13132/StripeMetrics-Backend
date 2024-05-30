# STRIPE DASHBOARD (Backend)

## Dashboard Widget Endpoints

- [x] MRR
- [x] Subscribers
- [x] MRR Movements
- [x] Average Staying
- [x] Customer Lifetime Value
- [x] Customer Churn Rate
- [x] Free to paid subscriptions
- [x] Free trials
- [x] Annual Run Rate


## Calculation

### 🐇 Customer Lifetime Value

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


### 🐇 Customer Churn Rate

- **Customer Churn Rate**
  ```
  Churn Rate = (Number of Canceled Subscriptions / Number of Active Subscriptions at the Start) * 100
  ```

### 🐇 Annual Run Rate

- **Annual Run Rate**

  Be sure, Annual Run Rate calcualted by following formular as the provider has only monthly subscriptions.
  ```
  Annual Run Rate = MRR * 12
  ```


## Environment

- Node.js v20.12.2 (LTS)
- npm v10.6.0
- PostgreSQL v16.2
