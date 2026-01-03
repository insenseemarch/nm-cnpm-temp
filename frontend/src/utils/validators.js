
import validator from 'validator';

export const isValidEmail = (email) => {
    // Sử dụng thư viện validator để kiểm tra email hợp lệ
    return validator.isEmail(email);
};


/**
 * Kiểm tra mật khẩu có đáp ứng yêu cầu mật khẩu mạnh
 * Yêu cầu:
 * - Ít nhất 8 ký tự
 * - Chứa ít nhất một chữ cái viết hoa
 * - Chứa ít nhất một chữ cái viết thường
 * - Chứa ít nhất một chữ số
 * - Chứa ít nhất một ký tự đặc biệt
 */
export const isValidPassword = (password) => {
    if (!password) return false;

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar;
};

/**
 * Trả về phản hồi chi tiết về độ mạnh của mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {object} - Đối tượng chứa isValid (boolean) và mảng các thông báo lỗi
 */
export const getPasswordStrength = (password) => {
    const errors = [];

    if (!password) {
        return { isValid: false, errors: ['Mật khẩu không được để trống'] };
    }

    if (password.length < 8) {
        errors.push('Ít nhất 8 ký tự');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Ít nhất một chữ cái viết hoa');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Ít nhất một chữ cái viết thường');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Ít nhất một chữ số');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Ít nhất một ký tự đặc biệt (!@#$%^&*...)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};
