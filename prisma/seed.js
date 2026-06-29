const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const questionsList = [
    {
      content: 'ข้อใดคือหน้าที่หลักของไต?',
      optionA: 'สูบฉีดเลือด',
      optionB: 'กรองของเสียออกจากเลือด',
      optionC: 'ย่อยอาหาร',
      optionD: 'ควบคุมอุณหภูมิร่างกาย',
      correctOption: 'B',
    },
    {
      content: 'ค่า GFR (Glomerular Filtration Rate) หมายถึงอะไร?',
      optionA: 'อัตราการเต้นของหัวใจ',
      optionB: 'ความดันโลหิต',
      optionC: 'อัตราการกรองของไต',
      optionD: 'ระดับน้ำตาลในเลือด',
      correctOption: 'C',
    },
    {
      content: 'ผู้ป่วยโรคไตเรื้อรังระยะสุดท้าย (ESRD) มักมีค่า GFR เท่าใด?',
      optionA: '> 90',
      optionB: '60 - 89',
      optionC: '30 - 59',
      optionD: '< 15',
      correctOption: 'D',
    },
    {
      content: 'อาหารประเภทใดที่ผู้ป่วยโรคไตควรหลีกเลี่ยง?',
      optionA: 'อาหารรสจัดและเค็มจัด',
      optionB: 'ผักผลไม้ทุกชนิด',
      optionC: 'ข้าวสวย',
      optionD: 'น้ำเปล่า',
      correctOption: 'A',
    },
    {
      content: 'การฟอกเลือดด้วยเครื่องไตเทียม (Hemodialysis) คืออะไร?',
      optionA: 'การผ่าตัดเปลี่ยนไต',
      optionB: 'การใช้เครื่องจักรกรองของเสียแทนไต',
      optionC: 'การล้างไตทางหน้าท้อง',
      optionD: 'การใช้ยารักษาไต',
      correctOption: 'B',
    },
    {
      content: 'ข้อใดเป็นสาเหตุหลักที่ทำให้เกิดโรคไตเรื้อรัง?',
      optionA: 'การดื่มน้ำน้อย',
      optionB: 'โรคเบาหวานและโรคความดันโลหิตสูง',
      optionC: 'การกินวิตามินซี',
      optionD: 'การออกกำลังกายหนัก',
      correctOption: 'B',
    },
    {
      content: 'ผู้ป่วยโรคไตเรื้อรังควรจำกัดการบริโภคแร่ธาตุชนิดใดมากที่สุด?',
      optionA: 'แคลเซียม',
      optionB: 'โซเดียมและโพแทสเซียม',
      optionC: 'เหล็ก',
      optionD: 'แมกนีเซียม',
      correctOption: 'B',
    },
    {
      content: 'อาการใดที่บ่งบอกว่าอาจมีภาวะโรคไต?',
      optionA: 'ปัสสาวะเป็นฟองและบวมตามตัว',
      optionB: 'ปวดหัวรุนแรง',
      optionC: 'หิวบ่อย',
      optionD: 'ไอเรื้อรัง',
      correctOption: 'A',
    },
    {
      content: 'การป้องกันโรคไตเรื้อรังที่ดีที่สุดคือข้อใด?',
      optionA: 'กินยาแก้ปวดเป็นประจำ',
      optionB: 'ตรวจสุขภาพประจำปีและควบคุมความดัน/น้ำตาล',
      optionC: 'ไม่กินเนื้อสัตว์เลย',
      optionD: 'ดื่มน้ำอัดลมแทนน้ำเปล่า',
      correctOption: 'B',
    },
    {
      content: 'การรักษาโรคไตเรื้อรังระยะสุดท้ายมีกี่วิธีหลักๆ?',
      optionA: '1 วิธี',
      optionB: '2 วิธี',
      optionC: '3 วิธี (ฟอกเลือด, ล้างหน้าท้อง, ปลูกถ่ายไต)',
      optionD: '4 วิธี',
      correctOption: 'C',
    },
    {
      content: 'การตรวจหาโปรตีนรั่วในปัสสาวะ (Microalbuminuria) มีความสำคัญอย่างไร?',
      optionA: 'ตรวจการทำงานของตับ',
      optionB: 'เป็นสัญญาณเตือนเริ่มแรกของโรคไตเรื้อรัง',
      optionC: 'ตรวจหาโรคกระเพาะปัสสาวะอักเสบ',
      optionD: 'วัดระดับน้ำตาลในเลือด',
      correctOption: 'B',
    },
    {
      content: 'ข้อใดคือความดันโลหิตเป้าหมายสำหรับผู้ป่วยโรคไตเรื้อรังที่มีโปรตีนรั่วในปัสสาวะ?',
      optionA: '< 140/90 mmHg',
      optionB: '< 130/80 mmHg',
      optionC: '< 120/80 mmHg',
      optionD: '< 150/90 mmHg',
      correctOption: 'B',
    },
    {
      content: 'ผู้ป่วยโรคไตควรหลีกเลี่ยงผลไม้ชนิดใดเนื่องจากมีโพแทสเซียมสูง?',
      optionA: 'แอปเปิ้ล',
      optionB: 'ชมพู่',
      optionC: 'กล้วยและส้ม',
      optionD: 'สับปะรด',
      correctOption: 'C',
    },
    {
      content: 'ข้อใดคือประโยชน์ของการควบคุมอาหารโปรตีนในผู้ป่วยโรคไตก่อนฟอกเลือด?',
      optionA: 'ช่วยชะลอความเสื่อมของไต',
      optionB: 'ทำให้ผิวพรรณดีขึ้น',
      optionC: 'เพิ่มมวลกล้ามเนื้อ',
      optionD: 'ลดความเสี่ยงโรคกระดูก',
      correctOption: 'A',
    },
    {
      content: 'ยาแก้ปวดกลุ่มใดที่ควรหลีกเลี่ยงในผู้ป่วยโรคไตเรื้อรัง?',
      optionA: 'พาราเซตามอล',
      optionB: 'ยาแก้อักเสบที่ไม่ใช่สเตียรอยด์ (NSAIDs)',
      optionC: 'ยาแก้ปวดลดไข้ทั่วไป',
      optionD: 'วิตามินเสริม',
      correctOption: 'B',
    },
    {
      content: 'ภาวะแทรกซ้อนที่พบบ่อยในผู้ป่วยโรคไตเรื้อรังระยะสุดท้ายคืออะไร?',
      optionA: 'สายตาสั้น',
      optionB: 'ภาวะโลหิตจางและโรคกระดูก',
      optionC: 'ผมร่วง',
      optionD: 'น้ำหนักเพิ่มอย่างรวดเร็ว',
      correctOption: 'B',
    },
    {
      content: 'การล้างไตทางช่องท้อง (CAPD) ผู้ป่วยต้องทำด้วยตนเองความถี่เท่าใด?',
      optionA: 'วันละ 1 ครั้ง',
      optionB: 'สัปดาห์ละ 2-3 ครั้ง',
      optionC: 'วันละ 3-4 ครั้ง',
      optionD: 'เดือนละ 1 ครั้ง',
      correctOption: 'C',
    },
    {
      content: 'หน้าที่ของฮอร์โมนอีริโทรพอยอิติน (Erythropoietin) ที่สร้างจากไตคืออะไร?',
      optionA: 'ควบคุมความดันโลหิต',
      optionB: 'กระตุ้นการสร้างเม็ดเลือดแดง',
      optionC: 'ควบคุมระดับน้ำตาล',
      optionD: 'ย่อยสลายไขมัน',
      correctOption: 'B',
    },
    {
      content: 'การตรวจค่า Creatinine ในเลือด ใช้เพื่อประเมินสิ่งใด?',
      optionA: 'การทำงานของตับ',
      optionB: 'ระดับไขมันในเลือด',
      optionC: 'การทำงานของไต',
      optionD: 'การทำงานของหัวใจ',
      correctOption: 'C',
    },
    {
      content: 'เมื่อผู้ป่วยโรคไตมีอาการบวมน้ำ ควรปฏิบัติตัวอย่างไร?',
      optionA: 'ดื่มน้ำมากๆ เพื่อขับปัสสาวะ',
      optionB: 'กินยาสมุนไพรขับปัสสาวะ',
      optionC: 'จำกัดปริมาณน้ำดื่มและเกลือโซเดียม',
      optionD: 'ออกกำลังกายอย่างหนัก',
      correctOption: 'C',
    }
  ];

  // Create an Exam
  const examPretest = await prisma.exam.create({
    data: {
      title: 'โครงการประชุมแลกเปลี่ยนเรียนรู้การดูแลผู้ป่วยโรคไต จังหวัดกาญจนบุรี (Pretest)',
      type: 'PRETEST',
      questions: {
        create: questionsList,
      },
    },
  });

  const examPosttest = await prisma.exam.create({
    data: {
      title: 'โครงการประชุมแลกเปลี่ยนเรียนรู้การดูแลผู้ป่วยโรคไต จังหวัดกาญจนบุรี (Posttest)',
      type: 'POSTTEST',
      questions: {
        create: questionsList,
      },
    },
  });

  // Create Users & Submissions for dashboard demo
  const user1 = await prisma.user.create({
    data: { name: 'สมชาย รักดี', phone: '0812345678', hospital: 'โรงพยาบาลพหลพลพยุหเสนา' }
  });
  const user2 = await prisma.user.create({
    data: { name: 'สมหญิง จริงใจ', phone: '0898765432', hospital: 'โรงพยาบาลมะขามเตี้ย' }
  });

  // Create a passed submission for user1 to see certificate
  await prisma.submission.create({
    data: {
      userId: user1.id,
      examId: examPosttest.id,
      score: 100,
      isPassed: true,
    }
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
