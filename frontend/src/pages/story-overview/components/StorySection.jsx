import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const StorySection = () => {
  const [visibleChapters, setVisibleChapters] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { threshold: 0.3 });

  const storyChapters = [
    {
      id: 1,
      title: 'Chương I: Ánh Sao Lạc Giữa Vũ Trụ',
      content: `RiO là một hành tinh nhỏ bé, chưa hiểu hết về vũ trụ bao la xung quanh mình. Mỗi ngày, cậu vẫn tự hỏi: “Mình được sinh ra từ đâu? Và liệu giữa những hành tinh ngoài kia, có sợi dây liên kết nào nối mình với họ không?”

Một đêm nọ, giữa biển trời đen thẫm phủ đầy ánh sao, RiO bỗng thấy mình thật nhỏ bé, thật cô đơn.

Đúng lúc ấy, một ngôi sao nhỏ vụt qua, để lại phía sau một vệt sáng dài - như lời mời gọi, sự gợi ý, muốn giúp cậu tìm câu trả lời.

Với trái tim tò mò và khát khao được tìm thấy nơi mình thuộc về, RiO nhìn theo vệt sáng ấy và quyết định khởi hành. Hành trình tìm về cội nguồn của hành tinh RiO nhỏ bé chính thức bắt đầu.`,
      color: 'from-secondary to-accent',
    },
    {
      id: 2,
      title: 'Chương II: Dòng Ngân Hà Ký Ức',
      content: `Tiến sâu vào dải Ngân Hà, RiO bay qua hàng trăm hành tinh. Ban đầu, cậu nghĩ họ chỉ là những lữ hành cô độc, những người qua đường ngẫu nhiên.

Nhưng khi dừng lại và lắng nghe, Rio nhận ra điều kỳ diệu...

Mỗi hành tinh đều lưu giữ một mảnh ký ức - những câu chuyện nhỏ xoay quanh niềm vui, nỗi buồn, và cả những vết thương đã ngủ yên trong ánh sáng riêng của họ.

Có những nhóm hành tinh xoay quanh cùng một điểm vô hình - như thể một lực hấp dẫn bí ẩn nào đó đã gắn kết họ lại từ thuở ban đầu.

Mỗi hành tinh kể cho RiO nghe về hành trình của mình, về những lần chệch quỹ đạo, những cú va chạm suýt làm tan vỡ, nhưng rồi họ vẫn tìm lại được vị trí của mình trong hệ thống.

Nghe xong, trái tim RiO khẽ ấm lên.

Cậu hiểu rằng, trong vũ trụ bao la này, không ai thật sự tồn tại một mình.
Dù xa đến đâu, vẫn có những sợi dây vô hình đang âm thầm nối những người thân lại với nhau - bằng ký ức, bằng yêu thương, và bằng điều gì đó thật dịu dàng, mang tên “gắn bó”.`,
      color: 'from-accent to-cosmic-energy',
    },
    {
      id: 3,
      title: 'Chương III: Chòm Sao Gia Tộc',
      content: `Sau muôn dặm hành trình, RiO bay đến vùng không gian tĩnh lặng nhất của dải Ngân Hà. Giữa bức màn sao lấp lánh, hiện ra một chòm sao rực rỡ - nơi từng vệt sáng đan vào nhau tạo thành những sợi dây kết nối giữa các hành tinh, dáng vẻ ấy như một cây gia đình giữa vũ trụ.

RiO sững sờ nhận ra 

Tất cả những hành tinh mà cậu từng gặp - từ ngôi sao đầu tiên soi sáng đường đi, đến những hành tinh lặng lẽ quay quanh quỹ đạo riêng - đều thuộc về cùng một chòm sao, cùng một dòng chảy ký ức và huyết mạch.

Mỗi hành tinh là một thế hệ, một câu chuyện, một nhịp tim trong bản giao hưởng của vũ trụ này. Lúc ấy, Rio hiểu ra rằng mình chưa bao giờ đơn độc. Từ những vì sao xa xôi, tổ tiên cậu vẫn đang dõi theo, vẫn là ngọn đèn dẫn đường cho hành tinh bé nhỏ này.

Trên chòm sao ấy, luôn có một vị trí dành cho RiO - mỗi vòng quay của cậu là một nhịp nối, là lời tiếp bước của những điều chưa kể, là cách cậu góp phần khiến cây gia đình ấy tỏa sáng hơn bao giờ hết.

Vũ trụ của Rio bỗng trở nên thật gần gũi, thật ấm áp.`,
      color: 'from-cosmic-energy to-secondary',
    },
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setInterval(() => {
        setVisibleChapters((prev) => {
          if (prev < storyChapters?.length) {
            return prev + 1;
          }
          clearInterval(timer);
          return prev;
        });
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [isInView, storyChapters?.length]);

  return (
    <section ref={sectionRef} className="py-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground font-accent mb-6">
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Câu Chuyện Vũ Trụ
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Theo chân RiO khám phá những bí mật kỳ diệu về gia đình qua hành trình vũ trụ đầy cảm
            xúc
          </p>
        </motion.div>

        {/* Story Chapters */}
        <div className="space-y-12">
          {storyChapters?.map((chapter, index) => (
            <motion.div
              key={chapter?.id}
              className={`floating-content rounded-2xl p-8 ${
                index % 2 === 0 ? 'ml-0 mr-8' : 'ml-8 mr-0'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={
                visibleChapters > index
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: index % 2 === 0 ? -100 : 100 }
              }
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Chapter Header */}
              <div className="mb-6">
                <div
                  className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${chapter?.color} text-primary-foreground text-sm font-medium mb-4`}
                >
                  Chương {chapter?.id}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground font-accent">
                  {chapter?.title}
                </h3>
              </div>

              {/* Chapter Content */}
              <div className="prose prose-lg max-w-none">
                {chapter?.content?.split('\n\n')?.map((paragraph, pIndex) => (
                  <motion.p
                    key={pIndex}
                    className="text-muted-foreground leading-relaxed mb-4 last:mb-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={visibleChapters > index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + pIndex * 0.2,
                      ease: 'easeOut',
                    }}
                  >
                    {paragraph?.split('\n')?.map((line, lIndex) => (
                      <React.Fragment key={lIndex}>
                        {line}
                        {lIndex < paragraph?.split('\n')?.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </motion.p>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full opacity-60 animate-float"></div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 bg-secondary rounded-full opacity-40 animate-float"
                style={{ animationDelay: '1s' }}
              ></div>
            </motion.div>
          ))}
        </div>

        {/* Story Continuation Hint */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={visibleChapters >= storyChapters?.length ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="text-lg text-accent font-medium">Hành trình của RiO chỉ mới bắt đầu...</p>
          <div className="flex justify-center mt-4 space-x-2">
            {[...Array(3)]?.map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-accent rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorySection;
