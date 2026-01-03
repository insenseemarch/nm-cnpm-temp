import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from '../../../components/AppImage';

const CreatorConstellation = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { threshold: 0.3 });

  const teamMembers = [
    {
      id: 1,
      name: 'Nguyễn Minh Tú',
      role: 'Developer',
      description: 'Kiến trúc sư vũ trụ, tạo nên những thế giới kỳ diệu',
      avatar:
        'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/571211553_1193714436142731_1999655062818786216_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Eik55ntRh7AQ7kNvwG05PyU&_nc_oc=AdkMz0ud_m_HXOgs7Q3d73mh78dcRu2VgN1EX3EO6b-qQVvDQIE1A4CpxIVuh3m4cHM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=-OJL5GzbyJeiodPwgXqtTg&oh=00_AffLiugMZ9ULwHM40nQezhFe3On2PbLIqY6GDHLIE-kuUA&oe=6903B6CA',
      constellation: 'Chưa biết',
      studentID: '23120101',
    },
    {
      id: 2,
      name: 'Võ Hoàng Danh',
      role: 'Developer',
      description: 'Người dệt nên những câu chuyện cảm động về gia đình',
      avatar:
        'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/571211553_1193714436142731_1999655062818786216_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Eik55ntRh7AQ7kNvwG05PyU&_nc_oc=AdkMz0ud_m_HXOgs7Q3d73mh78dcRu2VgN1EX3EO6b-qQVvDQIE1A4CpxIVuh3m4cHM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=-OJL5GzbyJeiodPwgXqtTg&oh=00_AffLiugMZ9ULwHM40nQezhFe3On2PbLIqY6GDHLIE-kuUA&oe=6903B6CA',
      constellation: 'Bảo Bình',
      studentID: '23120117',
    },
    {
      id: 3,
      name: 'Hồ Khổng Tuyết Như',
      role: 'Developer',
      description: 'Thiết kế những thiên hà đầy màu sắc và cảm xúc',
      avatar:
        'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/571211553_1193714436142731_1999655062818786216_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Eik55ntRh7AQ7kNvwG05PyU&_nc_oc=AdkMz0ud_m_HXOgs7Q3d73mh78dcRu2VgN1EX3EO6b-qQVvDQIE1A4CpxIVuh3m4cHM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=-OJL5GzbyJeiodPwgXqtTg&oh=00_AffLiugMZ9ULwHM40nQezhFe3On2PbLIqY6GDHLIE-kuUA&oe=6903B6CA',
      constellation: 'Cự Giải',
      studentID: '23120152',
    },
    {
      id: 4,
      name: 'Nguyễn Hữu Phúc',
      role: 'Developer',
      description: 'Biến những cảm xúc thành những trải nghiệm kỳ diệu',
      avatar:
        'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/571211553_1193714436142731_1999655062818786216_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Eik55ntRh7AQ7kNvwG05PyU&_nc_oc=AdkMz0ud_m_HXOgs7Q3d73mh78dcRu2VgN1EX3EO6b-qQVvDQIE1A4CpxIVuh3m4cHM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=-OJL5GzbyJeiodPwgXqtTg&oh=00_AffLiugMZ9ULwHM40nQezhFe3On2PbLIqY6GDHLIE-kuUA&oe=6903B6CA',
      constellation: 'Kim Ngưu',
      studentID: '23120157',
    },
    {
      id: 5,
      name: 'Nguyễn Đoàn Xuân Thu',
      role: 'Developer',
      description: 'Kỹ sư vũ trụ, xây dựng những hệ thống hoàn hảo',
      avatar:
        'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/571211553_1193714436142731_1999655062818786216_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Eik55ntRh7AQ7kNvwG05PyU&_nc_oc=AdkMz0ud_m_HXOgs7Q3d73mh78dcRu2VgN1EX3EO6b-qQVvDQIE1A4CpxIVuh3m4cHM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=-OJL5GzbyJeiodPwgXqtTg&oh=00_AffLiugMZ9ULwHM40nQezhFe3On2PbLIqY6GDHLIE-kuUA&oe=6903B6CA',
      constellation: 'Kim Ngưu',
      studentID: '23120170',
    },
    {
      id: 6,
      name: 'Trần Thị Thủy Tiên',
      role: 'Developer',
      description: 'Người bảo vệ và nuôi dưỡng những giấc mơ vũ trụ',
      avatar:
        'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/571211553_1193714436142731_1999655062818786216_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Eik55ntRh7AQ7kNvwG05PyU&_nc_oc=AdkMz0ud_m_HXOgs7Q3d73mh78dcRu2VgN1EX3EO6b-qQVvDQIE1A4CpxIVuh3m4cHM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=-OJL5GzbyJeiodPwgXqtTg&oh=00_AffLiugMZ9ULwHM40nQezhFe3On2PbLIqY6GDHLIE-kuUA&oe=6903B6CA',
      constellation: 'Song Ngư',
      studentID: '23120172',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 px-6 relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        {/* Constellation Lines Background */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BB98FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#72E9FB" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M200,200 L400,150 L600,250 L800,180 L1000,220 L800,400 L600,350 L400,450 L200,380 Z"
            stroke="url(#constellationGradient)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold font-accent mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-secondary via-accent to-cosmic-energy bg-clip-text text-transparent">
              Chòm Sao Sáng Tạo
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Gặp gỡ những nhà phát triển đã cùng nhau tạo nên vũ trụ RiO - nơi mỗi thành viên là một
            ngôi sao tỏa sáng với tài năng riêng biệt
          </motion.p>
        </motion.div>

        {/* Team Constellation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers?.map((member, index) => (
            <motion.div
              key={member?.id}
              className="relative group"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 1,
                delay: 0.8 + index * 0.15,
                ease: 'easeOut',
              }}
            >
              {/* Member Card */}
              <div className="floating-content rounded-2xl p-6 text-center relative overflow-hidden cosmic-glow-hover transition-all duration-300">
                {/* Cosmic Aura */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-cosmic-energy/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Avatar with Cosmic Ring - OPTIMIZED */}
                <div className="relative mb-4 mx-auto w-24 h-24">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-accent/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-2 rounded-full overflow-hidden cosmic-glow">
                    <Image
                      src={member?.avatar}
                      alt={member?.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Member Info */}
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-foreground mb-1">{member?.name}</h3>
                  <p className="text-accent font-medium mb-3">{member?.role}</p>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {member?.description}
                  </p>

                  {/* Cosmic Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Chòm sao:</span>
                      <span className="text-accent font-medium">{member?.constellation}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="text-secondary font-medium">{member?.studentID}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-cosmic-energy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  initial={false}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Mission Statement */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className="floating-content rounded-2xl p-8 max-w-4xl mx-auto">
            <motion.div
              className="mb-6"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto text-accent"
              >
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <circle
                  cx="12"
                  cy="12"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <path
                  d="M12 2v4M12 18v4M22 12h-4M6 12H2"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.8"
                />
              </svg>
            </motion.div>

            <h3 className="text-2xl font-semibold text-foreground font-accent mb-4">
              Sứ Mệnh Chòm Sao
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Chúng tôi tin rằng mỗi gia đình đều có những câu chuyện đáng kể, những kết nối đặc
              biệt và những khoảnh khắc kỳ diệu. Sứ mệnh của chúng tôi là biến những câu chuyện ấy
              thành những hành trình khám phá đầy cảm xúc trong vũ trụ bao la của tình yêu thương.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorConstellation;
