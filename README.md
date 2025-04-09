# 🚀 Americanolabs Backend

An Express-based API that fetches and updates staking data from the Ethereum blockchain using ethers.js and Prisma ORM. Built for Web3 developers! 🌐💰

## ✨ Features
- 🔍 Fetch staking data for supported tokens
- 📌 Get staking data by protocol ID or token address
- 🔄 Update staking data by interacting with smart contracts
- 🗄️ Uses Prisma ORM for database interactions
- 🌍 Supports CORS and environment variables

## 📥 Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/optifi-edu/backend.git
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and configure environment variables:
   ```env
   DATABASE_URL=
   EDUCHAIN_TESTNET_RPC_URL=
   ```
4. Run database migrations (if using Prisma):
   ```sh
   npx prisma migrate dev
   ```

## 🚀 Usage

### 🏃 Start the Server
```sh
npm run dev  # For development
yarn start   # For production
```

### 🔗 API Endpoints

#### 📜 Get all staking data
```http
GET /staking
```

#### 🔍 Get staking data by protocol ID
```http
GET /staking/protocol/:idProtocol
```

#### 🔎 Get staking data by staking address
```http
GET /staking/address/:addressStaking
```

#### 🔄 Update staking data
```http
POST /staking/update
```

#### 🪙 Get token data
````http
GET /token
````

## 🛠️ Technologies Used
- 🖥️ **Express.js** - Web framework
- 🔗 **Ethers.js** - Blockchain interaction
- 🗄️ **Prisma ORM** - Database management
- 📜 **TypeScript** - Type safety
- 🔐 **dotenv** - Environment variable management
- 🌍 **CORS** - Cross-origin resource sharing

## 📜 License
This project is licensed under the **MIT License**.

## 🤝 Contributing
Feel free to open issues and pull requests to improve the project! 🚀