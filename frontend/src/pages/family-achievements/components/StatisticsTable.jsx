import React from 'react';
import { motion } from 'framer-motion';

const StatisticsTable = ({ statistics }) => {
  if (!statistics || statistics?.length === 0) return null;

  return (
    <motion.div
      className="floating-content rounded-2xl p-6 backdrop-blur-cosmic"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-xl font-semibold text-primary-foreground mb-6 text-center">
        Thống kê thành tích theo khoảng thời gian
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="mystical-border border-b">
              <th className="text-center py-4 px-6 text-accent font-medium">
                Loại thành tích
              </th>
              <th className="text-center py-4 px-6 text-accent font-medium">
                Số lượng đạt được
              </th>
            </tr>
          </thead>
          <tbody>
            {statistics?.map((stat, index) => (
              <motion.tr
                key={stat?.category}
                className="group hover:bg-secondary/5 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <td className="text-center py-4 px-6 text-foreground group-hover:text-accent transition-colors duration-300">
                  {stat?.category}
                </td>
                <td className="text-center py-4 px-6">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full text-accent font-semibold group-hover:from-secondary/30 group-hover:to-accent/30 transition-all duration-300">
                    {stat?.count}
                  </span>
                </td>
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
            Tổng cộng: {statistics?.reduce((sum, stat) => sum + stat?.count, 0)} thành tích
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatisticsTable;