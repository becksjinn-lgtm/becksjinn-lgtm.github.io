import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import goalImage1 from '../assets/8edcce207d4d2279e86ba22d150fa7f0a5424b82.png';
import goalImage2 from '../assets/7ecfa1e9848db70299e7470e99a6ab16b7085248.png';
import goalImage3 from '../assets/093b51eb9adba80521cb5e13d4235cf906a024c0.png';
import injuryImage from '../assets/551a30f193b6045b6c5f6dfbde9186f9fbf67a38.png';
import recruitImage1 from '../assets/611c0400101768421892f8fd24afb526a31d3928.png';
import recruitImage2 from '../assets/ea03cd5d7e3a69931917884d42198fbe85aa4df8.png';

interface Award {
  tag: string;
  name: string;
  desc: string;
  detail: string;
  images?: string[];
}

function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;
    
    // 증가 간격 결정 (큰 숫자는 더 큰 간격으로)
    const getStep = (current: number, target: number) => {
      if (target > 1000) return 50; // 1000 이상이면 50씩
      if (target > 200) return 5;   // 200 이상이면 5씩
      if (target > 50) return 2;    // 50 이상이면 2씩
      return 1;                     // 그 외는 1씩
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const rawValue = progress * end;
      const step = getStep(rawValue, end);
      const steppedValue = Math.floor(rawValue / step) * step;
      
      setCount(Math.min(steppedValue, end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // 마지막에 정확한 값 설정
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AwardModal({ award, isOpen, onClose }: { award: Award | null; isOpen: boolean; onClose: () => void }) {
  const [showWinner, setShowWinner] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && award) {
      setShowWinner(false);
      setCurrentImageIndex(0);
      // 1.5초 후 수상자 공개
      const timer = setTimeout(() => {
        setShowWinner(true);
        // 컨페티 생성
        const newConfetti = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
        }));
        setConfetti(newConfetti);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, award]);

  // 이미지 자동 슬라이드
  useEffect(() => {
    if (showWinner && award?.images && award.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % award.images!.length);
      }, 1500); // 1.5초마다 이미지 전환
      return () => clearInterval(interval);
    }
  }, [showWinner, award]);

  if (!isOpen || !award) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Confetti */}
      {showWinner && confetti.map((item) => (
        <motion.div
          key={item.id}
          className="absolute w-2 h-2 bg-gold rounded-full"
          style={{ left: `${item.x}%`, top: '-10%' }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight * 1.2,
            opacity: [1, 1, 0],
            rotate: 360 * 3,
          }}
          transition={{
            duration: 3,
            delay: item.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Modal Content */}
      <motion.div
        className="relative bg-gradient-to-br from-zinc-900 to-black border-2 border-gold rounded-[40px] p-12 max-w-2xl w-full"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors text-2xl"
        >
          ✕
        </button>

        {/* Award Category */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-block bg-gold text-black px-6 py-2 rounded-full en font-extrabold text-sm mb-4">
            {award.tag}
          </div>
          <h3 className="text-2xl text-gray-300">{award.desc}</h3>
        </motion.div>

        {/* Envelope Animation */}
        {!showWinner && (
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-48 h-32 border-4 border-gold rounded-lg relative overflow-hidden"
              animate={{
                rotateY: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Envelope flap */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gold to-yellow-600"
                style={{ transformOrigin: 'top' }}
                animate={{
                  scaleY: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="en text-4xl font-bold text-black">?</span>
              </div>
            </motion.div>
            <p className="text-gold mt-6 text-xl en font-bold animate-pulse">
              Opening...
            </p>
          </motion.div>
        )}

        {/* Winner Reveal */}
        {showWinner && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            {/* Spotlight effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold rounded-full blur-[100px]" />
            </motion.div>

            {/* Trophy Icon */}
            <motion.div
              className="text-8xl mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
            >
              🏆
            </motion.div>

            {/* Winner Name */}
            <motion.h2
              className="text-6xl font-extrabold text-gold mb-4 en"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {award.name}
            </motion.h2>

            {/* ATTENDANCE KING - Stats with Counter Animation */}
            {award.tag === 'ATTENDANCE KING' ? (
              <>
                {/* Stats Grid */}
                <motion.div
                  className="grid grid-cols-3 gap-4 mt-8 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {[
                    { value: 100, label: '출석률', suffix: '%' },
                    { value: 3120, label: '총 이동거리', suffix: 'km' },
                    { value: 48, label: '이동시간', suffix: '시간' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-zinc-900/50 p-6 rounded-2xl border border-gold/30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <h3 className="en text-4xl text-gold font-bold mb-2">
                        <Counter end={stat.value} suffix={stat.suffix} duration={2} />
                      </h3>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Additional Rankings */}
                <motion.div
                  className="text-left bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-lg mb-2">
                    <span className="text-gold font-bold">공동 2등:</span> 이진우, 정세진 <span className="text-gold">(88%)</span>
                  </p>
                  <p className="text-lg">
                    <span className="text-gold font-bold">4등:</span> 이대열 <span className="text-gold">(67%)</span>
                  </p>
                </motion.div>
              </>
            ) : (
              /* Other Awards - Regular Detail */
              <motion.p
                className="text-xl text-gray-300 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {award.detail}
              </motion.p>
            )}

            {/* Congratulations */}
            <motion.p
              className="text-3xl text-white mt-8 en font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              🎉 CONGRATULATIONS! 🎉
            </motion.p>

            {/* 이미지 슬라이드 */}
            {award.images && award.images.length > 0 && (
              <motion.div
                className="mt-8 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="relative aspect-video overflow-hidden rounded-2xl">
                  {award.images.map((image, index) => (
                    <motion.img
                      key={index}
                      src={image}
                      alt={`${award.tag} ${index + 1}`}
                      className={`absolute inset-0 w-full h-full ${
                        award.tag === 'RECRUITMENT AWARD' ? 'object-contain' : 'object-cover'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: currentImageIndex === index ? 1 : 0,
                        scale: currentImageIndex === index ? 1 : 1.1
                      }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
                
                {/* Image Indicator */}
                <div className="flex justify-center gap-2 mt-4">
                  {award.images.map((_, index) => (
                    <motion.div
                      key={index}
                      className="w-2 h-2 rounded-full bg-gold"
                      animate={{
                        scale: currentImageIndex === index ? 1.5 : 1,
                        opacity: currentImageIndex === index ? 1 : 0.3
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const awards: Award[] = [
    { 
      tag: 'TOP SCORER', 
      name: '임강현', 
      desc: '2025 시즌 최다 득점 기록', 
      detail: '시즌 내내 압도적인 득점력으로 팀의 승리를 이끈 에이스',
      images: [goalImage1, goalImage2, goalImage3]
    },
    { tag: 'MULTI-PLAYER', name: '장성준', desc: '전 포지션을 아우르는 활약', detail: '공격수부터 수비까지 모든 포지션을 소화하며 팀의 만능 플레이어로 활약' },
    { tag: 'PASSION AWARD', name: '윤원', desc: '경기장 위의 끊임없는 투혼', detail: '경기 시작부터 종료까지 멈추지 않는 열정으로 팀에 활력을 불어넣음' },
    { tag: 'LONG DISTANCE', name: '이대열', desc: '몽골 입국 당일 경기장 직행', detail: '몽골 출장에서 돌아온 그날 저녁, 피곤함을 뒤로하고 경기장에 나타난 진정한 헌신' },
    { tag: 'COMMUNICATION', name: '이종찬', desc: '당직과 난관을 뚫은 참여 의지', detail: '어려운 근무 스케줄 속에서도 팀과의 약속을 지키기 위해 최선을 다한 열정' },
    { 
      tag: 'WARRIOR SPIRIT', 
      name: '이진우', 
      desc: '부상을 딛고 일어선 불굴의 의지', 
      detail: '아킬레스 부상에도 불구하고 긴 재활 과정을 거쳐 경기장으로 복귀한 진정한 전사. 통증을 극복하고 팀을 향한 열정을 포기하지 않은 정신력',
      images: [injuryImage]
    },
    { 
      tag: 'RECRUITMENT AWARD', 
      name: '김청운', 
      desc: '팀의 성장을 이끈 전도사', 
      detail: '장성준을 팀에 영입하여 새로운 활력을 불어넣고, 팀의 전력 향상에 크게 기여한 공로',
      images: [recruitImage1, recruitImage2]
    },
  ];

  const attendanceKing: Award = {
    tag: 'ATTENDANCE KING',
    name: '전대현',
    desc: '2025 SEASON ATTENDANCE KING',
    detail: '출석률 100% | 총 이동거리 3,120km | 이동시간 48시간\n공동 2등: 이진우, 정세진 (88%) | 4등: 이대열 (67%)'
  };

  const handleAwardClick = (award: Award) => {
    setSelectedAward(award);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAward(null), 300);
  };

  return (
    <>
      <style>{`
        body {
          background-color: #000000;
          color: #fff;
          font-family: 'Pretendard', sans-serif;
          margin: 0;
          overflow-x: hidden;
        }
        
        .en {
          font-family: 'Bricolage Grotesque', sans-serif;
          letter-spacing: -0.05em;
        }
        
        .text-gold {
          color: #C5A059;
        }
        
        .bg-gold {
          background-color: #C5A059;
        }
        
        .border-gold {
          border-color: #C5A059;
        }
        
        .bg-zinc-900 {
          background-color: #121212;
        }
        
        .border-zinc-800 {
          border-color: #27272a;
        }
        
        .bg-glow {
          background: radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.05) 0%, transparent 70%);
        }
        
        .section-padding {
          padding: 120px 0;
        }

        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #C5A059, #FFD700);
          transform-origin: 0%;
          z-index: 100;
        }
      `}</style>
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="scroll-progress"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="relative min-h-screen">
        {/* Premium Background Effect with Parallax */}
        <motion.div 
          className="fixed top-0 left-0 w-full h-full pointer-events-none bg-glow" 
          style={{ y: backgroundY }}
        />

        <div className="container mx-auto px-6 max-w-[1100px]">
          {/* Hero Section */}
          <section className="hero h-[90vh] flex flex-col justify-center items-center text-center">
            <motion.h1 
              className="en text-[clamp(3rem,8vw,7rem)] font-extrabold m-0 leading-[0.9] uppercase"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              THE YEAR-END:<br />
              <motion.span 
                className="text-gold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              >
                &#91;FCKT. 2025&#93;
              </motion.span>
            </motion.h1>
            <motion.div 
              className="date-info mt-10 text-gold text-xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              2025. 12. 21 (SUN) 17:00 | 칸지고고 과천 중앙동점
            </motion.div>
          </section>

          {/* Season Report */}
          <section className="section-padding border-t border-zinc-800">
            <motion.h2 
              className="en text-[2.5rem] mb-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              SEASON REPORT
            </motion.h2>
            <div className="stats-grid grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mt-[60px]">
              {[
                { value: 24, label: 'Total Meetings', suffix: '' },
                { value: 56.3, label: 'Total Win Rate', suffix: '%' },
                { value: 233, label: 'Total Participants', suffix: '' },
                { value: 75, label: '2nd Half Win Rate', suffix: '%' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-card bg-zinc-900 p-10 rounded-3xl border border-zinc-800"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, borderColor: '#C5A059' }}
                >
                  <h3 className="en text-[3.5rem] text-gold m-0">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="text-gray-500 uppercase text-[0.8rem] mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <motion.p 
              className="text-[#666] mt-10 leading-[1.8]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              * 총 52주 중 24회 모임 진행 (46%)<br />
              * 경기 16회, 훈련 5회, 자유운동 3회<br />
              * 후반기 풋살 5경기 중 4승 1패 기록 (승률 75%)
            </motion.p>
          </section>

          {/* Match Statistics */}
          <section className="section-padding border-t border-zinc-800">
            <motion.h2 
              className="en text-[2.5rem] mb-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              경기 및 통계
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* 전반기 */}
              <motion.div
                className="p-8 rounded-3xl border-2 border-[#C5A059] bg-gradient-to-br from-zinc-900/50 to-black/50"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold mb-6">전반기 (축구 4경기 / 풋살 7경기)</h3>
                <div className="mb-6">
                  <p className="text-xl mb-2">총 11경기 <span className="text-gold">5승</span> 1무 5패</p>
                  <p className="text-lg text-gray-400">(승률 45.5%)</p>
                </div>
                
                <div className="space-y-4">
                  <div className="pl-4 border-l-2 border-blue-400">
                    <p className="font-semibold mb-2">축구 : 1무 3패 (0%)</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• vs 피디케이&nbsp;&nbsp;&nbsp;&nbsp;4 : 8&nbsp;&nbsp;&nbsp;&nbsp;(패)</li>
                      <li>• vs 수촌 fc&nbsp;&nbsp;&nbsp;&nbsp;2 : 5~7&nbsp;&nbsp;(패)</li>
                      <li>• vs gs fc&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3 : 3&nbsp;&nbsp;&nbsp;&nbsp;(무)</li>
                      <li>• vs 문원축구회&nbsp;&nbsp;3 : 4&nbsp;&nbsp;&nbsp;&nbsp;(패)</li>
                    </ul>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-gold">
                    <p className="font-semibold mb-2">풋살 : 5승 2패 (71.5%)</p>
                    <p className="text-sm text-gray-400">• 4월 백마에게 2연전 패배</p>
                  </div>
                </div>
              </motion.div>

              {/* 후반기 */}
              <motion.div
                className="p-8 rounded-3xl border-2 border-[#C5A059] bg-gradient-to-br from-zinc-900/50 to-black/50"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold mb-6">후반기 (풋살 5경기)</h3>
                <div className="mb-6">
                  <p className="text-xl mb-2">총 5경기 <span className="text-gold">4승</span> 1패</p>
                  <p className="text-lg text-gray-400">(승률 75%)</p>
                </div>
                
                <div className="space-y-4">
                  <div className="pl-4 border-l-2 border-gold">
                    <p className="font-semibold mb-2">풋살 : 4승 1패</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• vs 피에프&nbsp;&nbsp;&nbsp;&nbsp;7 : 5&nbsp;&nbsp;&nbsp;&nbsp;(승)</li>
                      <li>• vs 피에프&nbsp;&nbsp;&nbsp;&nbsp;15 : 13&nbsp;&nbsp;(승)</li>
                      <li>• vs 투게더&nbsp;&nbsp;&nbsp;&nbsp;? : ?&nbsp;&nbsp;&nbsp;&nbsp;(패)</li>
                      <li>• vs 피에프&nbsp;&nbsp;&nbsp;&nbsp;17 : 13&nbsp;&nbsp;(승)</li>
                      <li>• vs 백마fs&nbsp;&nbsp;&nbsp;&nbsp;13 : 7&nbsp;&nbsp;&nbsp;&nbsp;(승)</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-4">
                    피에프 3승, 백마 1승 / 투게더 1패
                  </p>
                </div>
              </motion.div>
            </div>

            {/* 시즌 총합 */}
            <motion.div
              className="p-8 rounded-3xl border-2 border-blue-500 bg-gradient-to-r from-blue-950/30 to-blue-900/20 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-3xl mb-2">
                '25 시즌 <span className="text-white font-bold">9승 1무 6패</span>
              </p>
              <p className="text-2xl">
                승률 <span className="text-white font-bold text-4xl">56.3%</span>
              </p>
            </motion.div>
          </section>

          {/* 인원 및 통계 */}
          <section className="section-padding border-t border-zinc-800">
            <motion.h2 
              className="en text-[2.5rem] mb-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              인원 및 통계
            </motion.h2>

            <div className="space-y-6">
              {/* 참석인원 */}
              <motion.div
                className="p-8 rounded-3xl border-2 border-gold bg-gradient-to-br from-zinc-900/50 to-black/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-gold">참석인원 233명(23회)</h3>
                <div className="space-y-3 ml-4">
                  <p className="text-lg">
                    – 전반기 <span className="text-gold font-bold">163명</span> (용병 29명) – 축구 4회 / 풋살 12회
                  </p>
                  <p className="text-lg">
                    – 후반기 <span className="text-gold font-bold">70명</span> (용병 4명)
                  </p>
                </div>
              </motion.div>

              {/* 회원 통계 */}
              <motion.div
                className="p-8 rounded-3xl border-2 border-gold bg-gradient-to-br from-zinc-900/50 to-black/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-gold">회원 통계</h3>
                <div className="space-y-3 ml-4">
                  <p className="text-lg">
                    – 평균 <span className="text-gold font-bold">8명</span> 참석 (전반기 9명 / 후반기 7명)
                  </p>
                  <ul className="ml-6 space-y-2 text-gray-300">
                    <li>• 전반기 축구경기 / 후반기 자체훈련이 평균에 영향을 끼침</li>
                    <li>✕ 일정 취소시 참석인원 3~4명</li>
                  </ul>
                </div>
              </motion.div>

              {/* 용병 통계 */}
              <motion.div
                className="p-8 rounded-3xl border-2 border-gold bg-gradient-to-br from-zinc-900/50 to-black/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-gold">용병 통계</h3>
                <div className="space-y-3 ml-4">
                  <p className="text-lg">
                    – 용병은 <span className="text-gold font-bold">33명</span>이 참여
                  </p>
                  <p className="text-lg">
                    – (중복없이) <span className="text-gold font-bold">27명</span>의 용병이 함께하였음
                  </p>
                  <p className="text-lg">
                    – 평균 참석인원 : <span className="text-gold font-bold">1명</span>
                  </p>
                </div>
              </motion.div>

              {/* 인사이트 */}
              <motion.div
                className="p-8 rounded-3xl border-2 border-blue-500 bg-gradient-to-r from-blue-950/30 to-blue-900/20 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-lg leading-relaxed">
                  축구 매칭시 용병 의존도가 높은 반면 풋살은 용병 의존도 낮음.<br />
                  따라서 축구로 완전 전환을 위해서는<br />
                  <span className="text-white font-bold">회원 참여 독려 및 신입회원 유치 필요.</span>
                </p>
              </motion.div>
            </div>
          </section>

          {/* Hall of Fame */}
          <section className="section-padding border-t border-zinc-800">
            <TiltCard className="hof-box">
              <motion.div 
                className="relative bg-gradient-to-br from-[#121212] to-black border-2 border-gold p-[60px] rounded-[40px] text-center cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ 
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(197,160,89,0.05)',
                  scale: 1.02
                }}
                onClick={() => handleAwardClick(attendanceKing)}
              >
                <motion.div 
                  className="absolute top-[-15px] left-1/2 -translate-x-1/2 bg-gold text-black px-5 py-1 rounded-full en font-extrabold text-sm"
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  ATTENDANCE KING
                </motion.div>
                
                {/* Hidden Winner - Question Marks */}
                <motion.div 
                  className="text-9xl mb-4 opacity-30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ???
                </motion.div>
                
                <p className="text-2xl mt-6 opacity-80">2025 SEASON ATTENDANCE KING</p>
                <div className="text-gray-400 text-sm en uppercase tracking-wider mt-4">Click to Reveal</div>
              </motion.div>
            </TiltCard>
          </section>

          {/* Awards */}
          <section className="section-padding border-t border-zinc-800">
            <motion.h2 
              className="en text-[2.5rem] mb-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              2025 FCKT AWARDS
            </motion.h2>
            <div className="awards-grid grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
              {awards.map((award, index) => (
                <TiltCard 
                  key={index} 
                  className="award-card"
                >
                  <motion.div
                    className="p-8 rounded-3xl bg-white/[0.02] border border-zinc-800 transition-all duration-300 h-full cursor-pointer flex flex-col justify-center items-center text-center min-h-[280px]"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      borderColor: '#C5A059',
                      backgroundColor: 'rgba(197,160,89,0.05)',
                      scale: 1.05
                    }}
                    onClick={() => handleAwardClick(award)}
                  >
                    <div className="award-tag text-gold font-bold text-lg mb-4 en">{award.tag}</div>
                    
                    {/* Hidden Winner - Question Marks */}
                    <motion.div 
                      className="text-8xl mb-4 opacity-30"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ???
                    </motion.div>
                    
                    <div className="text-gray-400 text-sm en uppercase tracking-wider">Click to Reveal</div>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          </section>

          {/* Footer */}
          <motion.footer 
            className="relative py-[120px] text-center border-t border-zinc-800 overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold rounded-full blur-[150px] opacity-10" />
            </motion.div>

            {/* Main Message */}
            <motion.div
              className="relative z-10"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h2 
                className="en text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-gold tracking-[-0.02em] mb-6 uppercase leading-tight"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                FORZA FCKT<br />
                <motion.span
                  className="text-white"
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(197,160,89,0)',
                      '0 0 40px rgba(197,160,89,0.8)',
                      '0 0 20px rgba(197,160,89,0)'
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  SEMPRE!
                </motion.span>
              </motion.h2>

              <motion.div
                className="en text-xl text-gray-400 mb-12 tracking-widest"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                2025 SEASON SETTLEMENT REPORT
              </motion.div>

              {/* Thank You Message with Stagger Effect */}
              <motion.p 
                className="text-3xl leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {['함께해', '주셔서', '감사합니다.'].map((word, index) => (
                  <motion.span
                    key={index}
                    className="inline-block mx-2"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 1 + (index * 0.2),
                      ease: "easeOut"
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.p>

              {/* Decorative Line */}
              <motion.div
                className="w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-12"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 1.6 }}
              />

              {/* Year Mark */}
              <motion.div
                className="en text-6xl font-bold text-gold/20 mt-8"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 1.8 }}
              >
                2025
              </motion.div>

              {/* Floating Particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gold rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.footer>
        </div>
      </div>
      
      {/* Award Modal */}
      <AwardModal 
        award={selectedAward} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}