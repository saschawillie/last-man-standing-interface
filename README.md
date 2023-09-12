This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Deploy and Run

1. Deploy Token contract: TOKEN_ADDR
2. Deploy Stacking contract and passing TOKEN_ADDR as parameter: STACKING_ADDR
3. Init Stacking contract
   1. minStakingAmount 100000000000000000000
   2. setAPR 100000
   3. setRewardTimestamp
   4. setSecondsPerRound 300
   5. enableStaking true
   6. enableRewards true
4. Add Rewards
   1. Token contract approve STACKING_ADDR 100000000000000000000
   2. addRewards TOKEN_ADDR 100000000000000000000
5. Stack Token
   1. Token contract approve STACKING_ADDR 100000000000000000000
   2. stakeTokens TOKEN_ADDR 100000000000000000000

## Interface interact

1. Claim: withdrawRewards TOKEN_ADDR
2. Stack: stakeTokens TOKEN_ADDR 100000000000000000000
3. UnStack: unstakeTokens TOKEN_ADDR 100000000000000000000
4. ----------
5. Compound: compoundRewards
6. calculateRewards -> 加入到 Claim 中
7. jackpotWinner
8. transferAccidentallyLockedTokens
