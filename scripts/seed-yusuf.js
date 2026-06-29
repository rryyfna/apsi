const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dosenId = 'cmqz24h7p0005dchsuunyda8w'; // Yusuf Priyandari (NIDN 0022127905)
  
  // 1. Delete existing classes for Yusuf to replace them
  await prisma.enrollment.deleteMany({
    where: {
      kelas: { dosenId: dosenId }
    }
  });
  
  await prisma.kelas.deleteMany({
    where: { dosenId: dosenId }
  });
  
  console.log("Deleted old classes and enrollments for Yusuf.");

  // 2. Define the target subjects with their semesters
  const targetSubjects = [
    { namaMk: 'Programa Komputer', kodeMk: 'TIK101', sks: 3, semester: 1 },
    { namaMk: 'Pengantar Teknologi Informasi', kodeMk: 'TIK102', sks: 2, semester: 1 },
    { namaMk: 'Sistem Basis Data', kodeMk: 'TIK201', sks: 3, semester: 4 },
    { namaMk: 'Analisis dan Perancangan Sistem Informasi (APSI)', kodeMk: 'TIK302', sks: 3, semester: 6 },
    { namaMk: 'Simulasi Sistem', kodeMk: 'TIK303', sks: 3, semester: 6 },
    { namaMk: 'Sistem Perencanaan Sumber Daya Perusahaan (ERP)', kodeMk: 'TIK401', sks: 3, semester: 7 },
    { namaMk: 'Kecerdasan Buatan dalam Industri', kodeMk: 'TIK402', sks: 2, semester: 7 }
  ];
  
  const mks = [];
  
  // 3. Ensure these subjects exist and have the correct semester
  for (const subject of targetSubjects) {
    let mk = await prisma.mataKuliah.findFirst({
      where: { kodeMk: subject.kodeMk }
    });
    
    if (!mk) {
      mk = await prisma.mataKuliah.create({
        data: {
          namaMk: subject.namaMk,
          kodeMk: subject.kodeMk,
          sks: subject.sks,
          semester: subject.semester,
          isNonTeaching: false
        }
      });
      console.log(`Created new MK: ${subject.namaMk} (Semester ${subject.semester})`);
    } else {
      // Update semester if it's missing or different
      mk = await prisma.mataKuliah.update({
        where: { id: mk.id },
        data: { semester: subject.semester }
      });
      console.log(`Found & Updated MK: ${mk.namaMk} (Semester ${subject.semester})`);
    }
    mks.push(mk);
  }

  const createdKelas = [];
  
  // Create classes for Yusuf
  for (let i = 0; i < mks.length; i++) {
    const mk = mks[i];
    const newKelas = await prisma.kelas.create({
      data: {
        namaKelas: `Kelas ${String.fromCharCode(65 + (i % 3))}`, // A, B, or C
        mataKuliahId: mk.id,
        dosenId: dosenId
      }
    });
    createdKelas.push(newKelas);
  }
  
  console.log(`Created ${createdKelas.length} new classes.`);
  
  // Find some students
  const mahasiswa = await prisma.mahasiswa.findMany({ take: 30 });
  
  console.log(`Found ${mahasiswa.length} Mahasiswa. Creating enrollments...`);
  
  let enrollmentCount = 0;
  
  for (const kelas of createdKelas) {
    // Enroll 15-25 random students per class
    const studentCount = Math.floor(Math.random() * 11) + 15; // 15 to 25
    
    for (let i = 0; i < studentCount; i++) {
      const student = mahasiswa[i % mahasiswa.length];
      const weights = ['A', 'A', 'A-', 'A-', 'B+', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'];
      const randomGrade = weights[Math.floor(Math.random() * weights.length)];
      
      // Avoid duplicate enrollment for the same student in the same class
      const existing = await prisma.enrollment.findFirst({
        where: { kelasId: kelas.id, mahasiswaId: student.id }
      });
      
      if (!existing) {
        await prisma.enrollment.create({
          data: {
            kelasId: kelas.id,
            mahasiswaId: student.id,
            huruf: randomGrade
          }
        });
        enrollmentCount++;
      }
    }
  }
  
  console.log(`Created ${enrollmentCount} enrollments with random grades.`);
  console.log("Seeding Yusuf Priyandari complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
