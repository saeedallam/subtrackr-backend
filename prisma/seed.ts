import { PrismaClient, BillingInterval, Role } from '@prisma/client'; import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main(){
 const hash=await bcrypt.hash('Password123!',12);
 const user=await prisma.user.upsert({where:{email:'demo@subtrackr.local'},update:{},create:{email:'demo@subtrackr.local',name:'Demo User',passwordHash:hash,role:Role.USER}});
 await prisma.user.upsert({where:{email:'admin@subtrackr.local'},update:{},create:{email:'admin@subtrackr.local',name:'Admin User',passwordHash:hash,role:Role.ADMIN}});
 const starter=await prisma.plan.upsert({where:{slug:'starter'},update:{},create:{name:'Starter',slug:'starter',description:'For personal subscriptions',price:9.99,currency:'USD',interval:BillingInterval.MONTHLY,trialDays:7}});
 await prisma.plan.upsert({where:{slug:'pro'},update:{},create:{name:'Pro',slug:'pro',description:'For power users',price:19.99,currency:'USD',interval:BillingInterval.MONTHLY,trialDays:14}});
 const existing=await prisma.subscription.findFirst({where:{userId:user.id}});
 if(!existing){const start=new Date();const end=new Date(start);end.setMonth(end.getMonth()+1);await prisma.subscription.create({data:{userId:user.id,planId:starter.id,currentPeriodStart:start,currentPeriodEnd:end}});}
 console.log('Seed complete');
}
main().finally(()=>prisma.$disconnect());
