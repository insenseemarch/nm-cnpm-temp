import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Heart } from 'lucide-react';

const MemberCard = ({ member }) => {
  const navigate = useNavigate();
  const getGenderColor = (gender) => {
    const colors = {
      female: 'from-pink-400/25 via-rose-400/20 to-pink-500/30', // bright pink/rose inspired
      male: 'from-blue-400/25 via-cyan-500/20 to-blue-500/30', // celestial highlights inspired
      other: 'from-purple-400/20 via-indigo-500/15 to-purple-600/25', // mystical discovery inspired
    };
    return colors?.[gender] || 'from-purple-400/20 via-indigo-500/15 to-purple-600/25';
  };

  const getGenderAccent = (gender) => {
    const accents = {
      female: 'text-pink-300',
      male: 'text-blue-400',
      other: 'text-purple-400',
    };
    return accents?.[gender] || 'text-purple-400';
  };

  const calculateAge = (birthYear, deathYear) => {
    if (deathYear) {
      return deathYear - birthYear;
    }
    return new Date().getFullYear() - birthYear;
  };

  const formatLifespan = (birthYear, deathYear) => {
    if (deathYear) {
      return `${birthYear} - ${deathYear}`;
    }
    return `${birthYear} - nay`;
  };

  const getAvatarInitials = (name) => {
    return (
      name
        ?.split(' ')
        ?.map((n) => n.charAt(0))
        ?.slice(-2)
        ?.join('') || 'NA'
    );
  };

  return (
    <motion.div
      className={`floating-content rounded-2xl p-6 group cursor-pointer bg-gradient-to-br ${getGenderColor(member?.gender)} relative overflow-hidden ${
        member?.deathYear ? 'opacity-40 grayscale-[0.3]' : ''
      }`}
      onClick={() => navigate(`/members/${member?.id}`)}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 30px rgba(114, 233, 251, 0.3)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      {/* Generation Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <div
          className={`px-2 py-1 bg-accent/20 backdrop-blur-sm rounded-full text-xs font-medium border border-accent/30 ${getGenderAccent(member?.gender)}`}
        >
          Đời {member?.generation}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-surface/30 border-2 border-accent/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {member?.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-cosmic-glow">
              {getAvatarInitials(member?.name)}
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className={`text-xl font-semibold text-cosmic-glow mb-2 truncate`}>{member?.name}</h3>

          {/* Birth - Death Years and Age */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar size={14} className="opacity-70" />
              <span>{formatLifespan(member?.birthYear, member?.deathYear)}</span>
            </div>
            <span className="text-muted-foreground/60">•</span>
            <span className={`font-medium ${getGenderAccent(member?.gender)}`}>
              {calculateAge(member?.birthYear, member?.deathYear)} tuổi
            </span>
          </div>

          {/* Hometown */}
          {member?.hometown && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground/80">
              <MapPin size={14} className="opacity-70" />
              <span>{member?.hometown}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground/60">Nhấn để xem chi tiết</div>
      </div>
    </motion.div>
  );
};

export default MemberCard;
