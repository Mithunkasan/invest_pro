import { prisma } from '../lib/prisma'

async function syncWalletMainBalance(tx: any, userId: string) {
  const wallet = await tx.wallet.findUnique({ where: { userId } })
  if (!wallet) return
  const newMainBalance =
    (wallet.rewardBalance || 0) +
    (wallet.referralBalance || 0) +
    (wallet.levelBalance || 0) +
    (wallet.shareBalance || 0) +
    (wallet.bonusBalance || 0) +
    (wallet.taskBalance || 0)
  await tx.wallet.update({ where: { userId }, data: { mainBalance: newMainBalance } })
}

async function run() {
  console.log('--- CORRECTING AFFECTED USERS TRANSACTIONS & WALLETS ---')

  await prisma.$transaction(async (tx) => {
    // 1. Correct Jeevitha V (rkadirvelan@gmail.com)
    const jeevithaId = 'cmqp81v6j0000jo04k6f7a6a7' // We'll find by email in transaction log
    const jeevithaTxId = 'cmrjcyz9e0001jr04jn6ih6i2'
    const jeevithaOldAmount = 0.1
    const jeevithaNewAmount = 1000.0
    const jeevithaDiff = jeevithaNewAmount - jeevithaOldAmount

    const txJeevitha = await tx.transaction.findUnique({ where: { id: jeevithaTxId } })
    if (txJeevitha) {
      await tx.transaction.update({
        where: { id: jeevithaTxId },
        data: {
          amount: jeevithaNewAmount,
          description: 'TimeWall Reward: ₹1000.00'
        }
      })
      await tx.wallet.update({
        where: { userId: txJeevitha.userId },
        data: {
          taskBalance: { increment: jeevithaDiff },
          totalEarned: { increment: jeevithaDiff }
        }
      })
      await syncWalletMainBalance(tx, txJeevitha.userId)
      console.log(`Successfully corrected Jeevitha V's transaction and wallet (added +₹${jeevithaDiff})`)
    }

    // 2. Correct Veerasundari M (smileyveera1995@gmail.com)
    const veeraTxId = 'cmrjfkx360001l904llyxi6n6'
    const veeraOldAmount = 0.05
    const veeraNewAmount = 500.0
    const veeraDiff = veeraNewAmount - veeraOldAmount

    const txVeera = await tx.transaction.findUnique({ where: { id: veeraTxId } })
    if (txVeera) {
      await tx.transaction.update({
        where: { id: veeraTxId },
        data: {
          amount: veeraNewAmount,
          description: 'TimeWall Reward: ₹500.00'
        }
      })
      await tx.wallet.update({
        where: { userId: txVeera.userId },
        data: {
          taskBalance: { increment: veeraDiff },
          totalEarned: { increment: veeraDiff }
        }
      })
      await syncWalletMainBalance(tx, txVeera.userId)
      console.log(`Successfully corrected Veerasundari M's transaction and wallet (added +₹${veeraDiff})`)
    }

    // 3. Correct sharmila Yadav (prakash2309@gmail.com)
    const sharmilaTxId = 'cms6hziv90001lb040q581x3y'
    const sharmilaOldAmount = 0.0094675
    const sharmilaNewAmount = 94.675
    const sharmilaDiff = sharmilaNewAmount - sharmilaOldAmount

    const txSharmila = await tx.transaction.findUnique({ where: { id: sharmilaTxId } })
    if (txSharmila) {
      await tx.transaction.update({
        where: { id: sharmilaTxId },
        data: {
          amount: sharmilaNewAmount,
          description: 'TimeWall Reward: ₹94.68'
        }
      })
      await tx.wallet.update({
        where: { userId: txSharmila.userId },
        data: {
          taskBalance: { increment: sharmilaDiff },
          totalEarned: { increment: sharmilaDiff }
        }
      })
      await syncWalletMainBalance(tx, txSharmila.userId)
      console.log(`Successfully corrected sharmila Yadav's transaction and wallet (added +₹${sharmilaDiff})`)
    }
  })

  console.log('--- FINAL VALIDATION ---')
  const users = ['rkadirvelan@gmail.com', 'smileyveera1995@gmail.com', 'prakash2309@gmail.com']
  for (const email of users) {
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        wallet: true,
        transactions: {
          where: { reference: { startsWith: 'TIMEWALL:' } }
        }
      }
    })
    console.log(`\nUser: ${user?.name} (${email})`)
    console.log('Wallet taskBalance:', user?.wallet?.taskBalance)
    console.log('Wallet mainBalance:', user?.wallet?.mainBalance)
    console.log('Transactions:')
    user?.transactions.forEach(t => {
      console.log(`- ID: ${t.id}, Amount: ${t.amount}, Ref: ${t.reference}, Desc: ${t.description}`)
    })
  }
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
