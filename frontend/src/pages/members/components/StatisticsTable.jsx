import React from 'react';
import { motion } from 'framer-motion';

const StatisticsTable = ({ statistics }) => {
  if (!statistics || statistics?.length === 0) return null;

  // Check if statistics are yearly stats or general member stats
  const isYearlyStats = statistics[0]?.hasOwnProperty('year');

  return (
    <motion.div
      className="floating-content rounded-2xl p-6 backdrop-blur-cosmic"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-xl font-semibold text-primary-foreground mb-6 text-center">
        {isYearlyStats ? 'Tăng giảm thành viên' : 'Thống kê thành viên gia phả'}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="mystical-border border-b">
              {isYearlyStats ? (
                <>
                  <th className="text-center py-4 px-4 text-accent font-medium">STT</th>
                  <th className="text-center py-4 px-4 text-accent font-medium">Năm</th>
                  <th className="text-center py-4 px-4 text-accent font-medium">Số lượng sinh</th>
                  <th className="text-center py-4 px-4 text-accent font-medium">
                    Số lượng kết hôn
                  </th>
                  <th className="text-center py-4 px-4 text-accent font-medium">Số lượng mất</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {statistics?.map((stat, index) => (
              <motion.tr
                key={isYearlyStats ? stat?.year : stat?.category}
                className="group hover:bg-secondary/5 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                {isYearlyStats ? (
                  <>
                    <td className="text-center py-4 px-4 text-foreground group-hover:text-accent transition-colors duration-300">
                      {stat?.stt}
                    </td>
                    <td className="text-center py-4 px-4 text-foreground group-hover:text-accent transition-colors duration-300">
                      {stat?.year}
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-error-foreground/20 to-error-foreground/30 rounded-full text-error-foreground font-semibold group-hover:from-error-foreground/30 group-hover:to-error-foreground/40 transition-all duration-300">
                        {stat?.births}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-full text-secondary font-semibold group-hover:from-secondary/30 group-hover:to-secondary/40 transition-all duration-300">
                        {stat?.marriages}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-error/20 to-error/30 rounded-full text-error font-semibold group-hover:from-error/30 group-hover:to-error/40 transition-all duration-300">
                        {stat?.deaths}
                      </span>
                    </td>
                  </>
                ) : null}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-center">
        <motion.div
          className="inline-flex items-center space-x-2 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-sm">
            {isYearlyStats
              ? `Tổng ${statistics?.length} năm có sự kiện`
              : `Tổng cộng: ${statistics?.reduce((sum, stat) => sum + stat?.count, 0)} thành viên`}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatisticsTable;
