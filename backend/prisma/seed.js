const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database drivers...");
  
  // Clear any existing drivers
  await prisma.driver.deleteMany();

  await prisma.driver.createMany({
    data: [
      { name: "Saber Ali", vehicle: "Tesla Model 5", plate: "TS09AB9999", rating: 4.9 },
      { name: "Rajesh K.", vehicle: "Hyundai i20", plate: "KA01AB1234", rating: 4.8 },
      { name: "Priya Singh", vehicle: "Tata Nexon EV", plate: "MH12CD5678", rating: 4.7 }
    ]
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
