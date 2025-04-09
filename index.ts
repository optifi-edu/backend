import express from "express";
import type { Request, Response } from "express";
import { ethers, ZeroAddress } from "ethers";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const educahinTestnetRPC = process.env.EDUCHAIN_TESTNET_RPC_URL || "";

const MOCK_DATA = [
  {
    nameToken: "EDU",
    token: "0x13BFA5eaE397e36593E788176C2FddcFffEC5075",
    staking: "0x91F048130C88C1f759A9bdC19883559d3Dc275a6",
    nameProject: "BlendFinance",
    chain: "EDU Chain Testnet",
    rpc: educahinTestnetRPC,
  },
  {
    nameToken: "WEDU",
    token: "0x89159C2A782ba2caE40Ec25C39A1f38397f1EED5",
    staking: "0xD95d2F7C38bfA2f9d7A618474Bc619470f01001F",
    nameProject: "SailFish",
    chain: "EDU Chain Testnet",
    rpc: educahinTestnetRPC,
  },
  {
    nameToken: "EDU",
    token: "0x13BFA5eaE397e36593E788176C2FddcFffEC5075",
    staking: "0x763A03a3328e475f75EE2Dd0329b27F02EeD2443",
    nameProject: "Camelot",
    chain: "EDU Chain Testnet",
    rpc: educahinTestnetRPC,
  },
  {
    nameToken: "EDU",
    token: "0x13BFA5eaE397e36593E788176C2FddcFffEC5075",
    staking: "0x4399B055b86C65bC2E91333D9118F98B974F052C",
    nameProject: "EdBank",
    chain: "EDU Chain Testnet",
    rpc: educahinTestnetRPC,
  },
  {
    nameToken: "WEDU",
    token: "0x89159C2A782ba2caE40Ec25C39A1f38397f1EED5",
    staking: "0xf8C1cfD46A543EfB13305b041Fc573550207FA79",
    nameProject: "MoveFlow",
    chain: "EDU Chain Testnet",
    rpc: educahinTestnetRPC,
  }
];

const MOCK_TOKEN_DATA = {
  tokens: [
    {
      id: 1,
      addressToken: "0x13BFA5eaE397e36593E788176C2FddcFffEC5075",
      symbol: "EDU",
      name: "EDU",
      decimals: 18,
      chain: "EDU Chain Testnet",
      logo: "https://s3.coinmarketcap.com/static-gravity/image/60f1fc5d85f2463881db170b6d740876.png",
      priceChange24H: 0,
      tags: ["NATIVE TOKEN", "STABLECOIN"]
    },
    {
      id: 2,
      addressToken: "0x89159C2A782ba2caE40Ec25C39A1f38397f1EED5",
      symbol: "WEDU",
      name: "Wrapped EDU",
      decimals: 18,
      chain: "EDU Chain Testnet",
      logo: "https://s3.coinmarketcap.com/static-gravity/image/60f1fc5d85f2463881db170b6d740876.png",
      priceChange24H: 0, 
      tags: ["NATIVE TOKEN"]
    }
  ]
};

const stakingABI = [
  "function fixedAPY() public view returns (uint8)",
  "function totalAmountStaked() public view returns (uint256)",
];

async function updateStakingData(index: number) {
  try {
    if (index >= MOCK_DATA.length) return;

    const { nameToken, token, staking, chain, nameProject, rpc } = MOCK_DATA[index];

    if (!rpc) {
      console.warn(`Missing RPC URL for ${nameProject} on ${chain}`);
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(staking, stakingABI, provider);

    const apy = await contract.fixedAPY();
    const totalStaked = await contract.totalAmountStaked();

    const formattedTVL = Number(ethers.formatUnits(totalStaked, 18));
    const formattedAPY = Number(apy);

    await prisma.staking.upsert({
      where: { idProtocol: nameProject + "_" + chain },
      update: {
      tvl: formattedTVL,
      apy: formattedAPY,
      updatedAt: new Date(),
      },
      create: {
      idProtocol: nameProject + "_" + staking,
      addressToken: token,
      addressStaking: staking,
      nameToken: nameToken,
      nameProject,
      chain,
      apy: formattedAPY,
      stablecoin: nameToken === "EDU",
      categories: ["Staking", nameToken === "EDU" ? "Stablecoin" : ""],
      logo: "https://s3.coinmarketcap.com/static-gravity/image/60f1fc5d85f2463881db170b6d740876.png",
      tvl: formattedTVL,
      },
    });

    console.log(`Updated staking data for ${nameProject} on ${chain}`);
  } catch (error) {
    console.error(`Error updating staking data for index ${index}:`, error);
  }
}

app.get("/staking", async (req: Request, res: Response) => {
  try {
    const data = await prisma.staking.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staking data" });
  }
});

app.get("/staking/protocol/:idProtocol", async (req: Request, res: Response) => {
  try {
    const { idProtocol } = req.params;
    const data = await prisma.staking.findMany({
      where: { idProtocol },
    });

    if (!data.length) {
      res.status(404).json({ error: "Staking data not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staking data" });
  }
});

app.get("/token", async (req: Request, res: Response) => {
  try {
    res.json(MOCK_TOKEN_DATA);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch token data" });
  }
});

app.post("/staking/update", async (req: Request, res: Response) => {
  try {
    const updatePromises = MOCK_DATA.map((_, index) => updateStakingData(index));

    const results = await Promise.allSettled(updatePromises);

    const failedUpdates = results.filter((res) => res.status === "rejected");
    if (failedUpdates.length > 0) {
      console.warn(`Some updates failed: ${failedUpdates.length}`);
    }

    res.json({ message: "All staking data updated successfully", failedUpdates });
  } catch (error) {
    res.status(500).json({ error: "Failed to update staking data" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
