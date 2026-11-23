/**
 * Generates privacy-safe synthetic demonstration assets completely on the client canvas.
 * Does not use real people's photographs.
 * Zero external network downloads required.
 */

export function createSyntheticDemoPhoto(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // 1. Studio backdrop: clean neutral off-white/light-grey
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
    bgGrad.addColorStop(0, '#F5F5F3');
    bgGrad.addColorStop(1, '#EAECE8');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 800);

    // Subtle vignette
    const radial = ctx.createRadialGradient(300, 360, 100, 300, 360, 420);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    radial.addColorStop(1, 'rgba(210, 215, 210, 0.4)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 600, 800);

    // 2. Formal Attire / Shoulders
    ctx.fillStyle = '#263B35'; // SpecFit spruce formal blazer
    ctx.beginPath();
    ctx.moveTo(80, 800);
    ctx.quadraticCurveTo(140, 580, 220, 570);
    ctx.lineTo(260, 640);
    ctx.lineTo(340, 640);
    ctx.lineTo(380, 570);
    ctx.quadraticCurveTo(460, 580, 520, 800);
    ctx.closePath();
    ctx.fill();

    // Shirt collar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(250, 570);
    ctx.lineTo(300, 660);
    ctx.lineTo(350, 570);
    ctx.lineTo(300, 590);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#D9A98A';
    ctx.fillRect(260, 470, 80, 110);

    // Neck shadow under chin
    ctx.fillStyle = '#C08D6E';
    ctx.beginPath();
    ctx.arc(300, 475, 45, 0, Math.PI);
    ctx.fill();

    // 3. Head & Face (Proportional anthropometric passport framing)
    ctx.fillStyle = '#E5B899';
    ctx.beginPath();
    // Oval face centered at (300, 360) with radiusX 95, radiusY 125
    ctx.ellipse(300, 360, 95, 125, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks / jawline shading
    ctx.strokeStyle = '#D19E7E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#DEAC8D';
    ctx.beginPath();
    ctx.ellipse(200, 370, 14, 28, -0.1, 0, Math.PI * 2);
    ctx.ellipse(400, 370, 14, 28, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#241F1C';
    ctx.beginPath();
    ctx.arc(300, 330, 105, Math.PI * 0.9, Math.PI * 2.1);
    ctx.quadraticCurveTo(405, 340, 395, 270);
    ctx.quadraticCurveTo(340, 220, 300, 220);
    ctx.quadraticCurveTo(250, 220, 205, 270);
    ctx.quadraticCurveTo(195, 340, 200, 360);
    ctx.closePath();
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#241F1C';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(240, 335);
    ctx.quadraticCurveTo(265, 328, 285, 335);
    ctx.moveTo(315, 335);
    ctx.quadraticCurveTo(335, 328, 360, 335);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(262, 355, 16, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(338, 355, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#30261E'; // Irises
    ctx.beginPath();
    ctx.arc(262, 355, 7, 0, Math.PI * 2);
    ctx.arc(338, 355, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(264, 353, 2, 0, Math.PI * 2);
    ctx.arc(340, 353, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#B88568';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(300, 345);
    ctx.lineTo(297, 390);
    ctx.lineTo(306, 393);
    ctx.stroke();

    // Mouth / Lips (Neutral, closed expression)
    ctx.fillStyle = '#B36D5B';
    ctx.beginPath();
    ctx.ellipse(300, 424, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8E4D3E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(280, 424);
    ctx.lineTo(320, 424);
    ctx.stroke();

    // Candidate identification caption badge (common requirement in UPSC/CUET)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(80, 720, 440, 50);
    ctx.strokeStyle = '#D0D5CE';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 720, 440, 50);

    ctx.fillStyle = '#202522';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A. K. SHARMA  •  SYNTHETIC SAMPLE', 300, 742);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#747A75';
    const today = new Date().toISOString().split('T')[0];
    ctx.fillText(`DATE OF PHOTO: ${today} • ZERO-UPLOAD DEMO`, 300, 760);

    canvas.toBlob((blob) => {
      const file = new File([blob!], 'sample-photo-synthetic.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      resolve(file);
    }, 'image/jpeg', 0.95);
  });
}

export function createSyntheticDemoSignature(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;

    // Clean white paper with slight warm paper texture
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, 600, 240);

    // Natural ink pen strokes: dark navy black ink
    ctx.strokeStyle = '#0E1724';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Capital 'A'
    ctx.moveTo(80, 160);
    ctx.lineTo(110, 65);
    ctx.lineTo(135, 160);
    ctx.moveTo(95, 125);
    ctx.lineTo(125, 125);

    // Period
    ctx.arc(145, 158, 2, 0, Math.PI * 2);

    // Capital 'K'
    ctx.moveTo(170, 70);
    ctx.lineTo(170, 160);
    ctx.moveTo(205, 75);
    ctx.lineTo(172, 115);
    ctx.lineTo(210, 160);

    // Period
    ctx.arc(220, 158, 2, 0, Math.PI * 2);

    // Cursive 'Sharma'
    // 'S'
    ctx.moveTo(250, 155);
    ctx.quadraticCurveTo(270, 65, 290, 80);
    ctx.quadraticCurveTo(260, 120, 295, 155);

    // 'h'
    ctx.lineTo(315, 60);
    ctx.lineTo(315, 155);
    ctx.quadraticCurveTo(325, 125, 335, 155);

    // 'a'
    ctx.quadraticCurveTo(345, 130, 355, 140);
    ctx.quadraticCurveTo(350, 155, 360, 155);

    // 'r'
    ctx.lineTo(375, 132);
    ctx.lineTo(385, 135);
    ctx.lineTo(385, 155);

    // 'm'
    ctx.quadraticCurveTo(395, 130, 405, 155);
    ctx.quadraticCurveTo(415, 130, 425, 155);

    // 'a'
    ctx.quadraticCurveTo(435, 130, 445, 140);
    ctx.quadraticCurveTo(440, 155, 455, 155);

    // Underline flourish
    ctx.moveTo(110, 185);
    ctx.bezierCurveTo(250, 175, 420, 195, 500, 170);
    ctx.stroke();

    // Two dots under flourish
    ctx.fillStyle = '#0E1724';
    ctx.beginPath();
    ctx.arc(270, 195, 2.5, 0, Math.PI * 2);
    ctx.arc(310, 195, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Demonstration badge at top right
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#A0A79F';
    ctx.textAlign = 'right';
    ctx.fillText('SYNTHETIC DEMO SIGNATURE • CLIENT-SIDE GENERATED', 580, 25);

    canvas.toBlob((blob) => {
      const file = new File([blob!], 'sample-signature-synthetic.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      resolve(file);
    }, 'image/jpeg', 0.95);
  });
}

export function createSyntheticDemoDocument(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1414; // A4 aspect ratio (1:1.414)
    const ctx = canvas.getContext('2d')!;

    // Document Paper background
    ctx.fillStyle = '#FCFBF9';
    ctx.fillRect(0, 0, 1000, 1414);

    // Subtle paper scan shadow at the edges
    const grad = ctx.createLinearGradient(0, 0, 1000, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.03)');
    grad.addColorStop(0.04, 'rgba(0,0,0,0)');
    grad.addColorStop(0.96, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.04)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 1414);

    // Decorative certificate border
    ctx.strokeStyle = '#34483E';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 900, 1314);

    ctx.strokeStyle = '#CBD0C8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, 876, 1290);

    // Seal emblem at top
    ctx.fillStyle = '#34483E';
    ctx.beginPath();
    ctx.arc(500, 170, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SF', 500, 178);

    // Document Header
    ctx.fillStyle = '#242824';
    ctx.font = 'bold 32px serif';
    ctx.fillText('ACADEMIC & PROFESSIONAL CREDENTIAL', 500, 270);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#737872';
    ctx.fillText('VERIFIED DOCUMENT RECORD • SPECIMEN COPY', 500, 305);

    // Document Body simulation lines
    ctx.strokeStyle = '#DFE2DC';
    ctx.lineWidth = 2;
    for (let y = 370; y <= 900; y += 45) {
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(900, y);
      ctx.stroke();
    }

    // Sample data block
    ctx.fillStyle = '#242824';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DOCUMENT IDENTIFIER: SF-DOC-2026-X9910', 120, 410);
    ctx.fillText('ISSUED TO: ANANYA K. SHARMA', 120, 500);
    ctx.fillText('DATE OF VERIFICATION: 2026-11-20', 120, 590);
    ctx.fillText('STATUS: AUTHENTICATED ZERO-UPLOAD RECORD', 120, 680);
    ctx.fillText('AUTHORITY: SPECIFICATION CLEARANCE BUREAU', 120, 770);

    // Official Stamp / Watermark (bottom right)
    ctx.save();
    ctx.translate(720, 1050);
    ctx.rotate(-0.15);
    ctx.strokeStyle = '#B44B43';
    ctx.lineWidth = 3;
    ctx.strokeRect(-90, -45, 180, 90);
    ctx.fillStyle = '#B44B43';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIALLY VERIFIED', 0, -10);
    ctx.font = '12px sans-serif';
    ctx.fillText('SPECFIT CLIENT TEST', 0, 15);
    ctx.restore();

    // Signature line
    ctx.strokeStyle = '#242824';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, 1150);
    ctx.lineTo(400, 1150);
    ctx.stroke();

    ctx.fillStyle = '#737872';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Authorized Signature & Registrar Seal', 150, 1175);

    canvas.toBlob((blob) => {
      const file = new File([blob!], 'sample-document-scan.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      resolve(file);
    }, 'image/jpeg', 0.92);
  });
}

export function createSyntheticDemoLandscape(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800; // 3:2 landscape
    const ctx = canvas.getContext('2d')!;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 500);
    sky.addColorStop(0, '#365348');
    sky.addColorStop(0.5, '#688574');
    sky.addColorStop(1, '#D8DECE');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1200, 500);

    // Distant mountain ridge
    ctx.fillStyle = '#4E6357';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(180, 380);
    ctx.lineTo(380, 440);
    ctx.lineTo(600, 330);
    ctx.lineTo(820, 420);
    ctx.lineTo(1050, 350);
    ctx.lineTo(1200, 480);
    ctx.lineTo(1200, 500);
    ctx.closePath();
    ctx.fill();

    // Foreground mountain ridge
    ctx.fillStyle = '#2B3B32';
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(240, 430);
    ctx.lineTo(500, 480);
    ctx.lineTo(760, 410);
    ctx.lineTo(1020, 470);
    ctx.lineTo(1200, 520);
    ctx.lineTo(1200, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fill();

    // Lake surface
    const water = ctx.createLinearGradient(0, 520, 0, 800);
    water.addColorStop(0, '#1E2C25');
    water.addColorStop(1, '#131D18');
    ctx.fillStyle = water;
    ctx.fillRect(0, 520, 1200, 280);

    // Lake reflections / ripples
    ctx.strokeStyle = 'rgba(216, 222, 206, 0.2)';
    ctx.lineWidth = 1.5;
    for (let y = 540; y < 780; y += 20) {
      ctx.beginPath();
      ctx.moveTo(150 + Math.random() * 50, y);
      ctx.lineTo(1050 - Math.random() * 50, y);
      ctx.stroke();
    }

    // Technical stamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SPECFIT CALIBRATION SCENERY • 1200x800 RAW CLIENT RENDER', 1160, 770);

    canvas.toBlob((blob) => {
      const file = new File([blob!], 'sample-landscape-scenery.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      resolve(file);
    }, 'image/jpeg', 0.95);
  });
}
