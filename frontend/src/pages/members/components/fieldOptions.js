/**
 * Local field options for member forms
 * These are UI-only options, not fetched from backend
 */

// Address options (4 suggested)
export const ADDRESS_OPTIONS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'];

// Occupation options (15 suggested)
export const OCCUPATION_OPTIONS = [
  'Giáo viên',
  'Bác sĩ',
  'Kỹ sư',
  'Luật sư',
  'Kế toán',
  'Nông dân',
  'Công nhân',
  'Doanh nhân',
  'Nhân viên văn phòng',
  'Y tá',
  'Sinh viên',
  'Học sinh',
  'Nội trợ',
  'Nghỉ hưu',
  'Tự do',
];

// Cause of death options (12 suggested)
export const CAUSE_OF_DEATH_OPTIONS = [
  'Tuổi già',
  'Bệnh tim',
  'Ung thư',
  'Tai biến',
  'Tai nạn giao thông',
  'Bệnh hô hấp',
  'Tiểu đường',
  'Suy thận',
  'Đột quỵ',
  'Bệnh gan',
  'Tai nạn lao động',
  'Không rõ',
];

// Burial location options (3 suggested)
export const BURIAL_LOCATION_OPTIONS = [
  'Nghĩa trang gia đình',
  'Nghĩa trang thành phố',
  'Nghĩa trang quê hương',
];

// Province options for hometown (existing list)
export const PROVINCE_OPTIONS = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Huế',
  'Nha Trang',
  'Đà Lạt',
  'Hải Dương',
  'Nam Định',
  'Thái Bình',
  'Ninh Bình',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Bình',
  'Quảng Trị',
  'Quảng Nam',
  'Quảng Ngãi',
  'Bình Định',
  'Phú Yên',
  'Khánh Hòa',
  'Ninh Thuận',
  'Bình Thuận',
  'Kon Tum',
  'Gia Lai',
  'Đắk Lắk',
  'Đắk Nông',
  'Lâm Đồng',
  'Bình Phước',
  'Tây Ninh',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Long An',
  'Tiền Giang',
  'Bến Tre',
  'Trà Vinh',
  'Vĩnh Long',
  'Đồng Tháp',
  'An Giang',
  'Kiên Giang',
  'Hậu Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Cà Mau',
  'Điện Biên',
  'Lai Châu',
  'Lào Cai',
  'Hà Giang',
  'Cao Bằng',
  'Bắc Kạn',
  'Lạng Sơn',
  'Tuyên Quang',
  'Yên Bái',
  'Thái Nguyên',
  'Phú Thọ',
  'Vĩnh Phúc',
  'Bắc Giang',
  'Bắc Ninh',
  'Quảng Ninh',
  'Hưng Yên',
  'Hòa Bình',
  'Sơn La',
];

/**
 * Helper function to format date to dd/MM/yyyy
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Helper function to format date for input[type="date"] (yyyy-MM-dd)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};
