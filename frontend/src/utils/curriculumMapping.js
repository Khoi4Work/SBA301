/**
 * Mappings for Chapter, Section (Roman), and Part titles in the Philosophy Curriculum.
 */

export const CHAPTER_NAMES = {
    'Chương 1': 'Chương 1: Khái luận về Triết học và Triết học Mác - Lênin',
    'Chương 2': 'Chương 2: Chủ nghĩa duy vật biện chứng',
    'Chương 3': 'Chương 3: Chủ nghĩa duy vật lịch sử'
};

export const SECTION_NAMES = {
    'Chương 1': {
        'I': 'Mục I: Triết học và vấn đề cơ bản của triết học',
        'II': 'Mục II: Triết học Mác - Lênin và vai trò của triết học Mác - Lênin trong đời sống xã hội'
    },
    'Chương 2': {
        'I': 'Mục I: Vật chất và ý thức',
        'II': 'Mục II: Phép biện chứng duy vật',
        'III': 'Mục III: Lý luận nhận thức'
    },
    'Chương 3': {
        'I': 'Mục I: Học thuyết hình thái kinh tế - xã hội',
        'II': 'Mục II: Giai cấp và dân tộc',
        'III': 'Mục III: Nhà nước và cách mạng xã hội',
        'IV': 'Mục IV: Ý thức xã hội',
        'V': 'Mục V: Triết học về con người'
    }
};

export const PART_NAMES = {
    'Chương 1': {
        'I': {
            '1': 'Khái lược về triết học',
            '2': 'Vấn đề cơ bản của triết học',
            '3': 'Biện chứng và siêu hình'
        },
        'II': {
            '1': 'Sự ra đời và phát triển của triết học Mác - Lênin',
            '2': 'Đối tượng và chức năng của triết học Mác - Lênin',
            '3': 'Vai trò của triết học Mác - Lênin trong đời sống xã hội'
        }
    },
    'Chương 2': {
        'I': {
            '1': 'Vật chất và phương thức tồn tại của vật chất',
            '2': 'Nguồn gốc, bản chất và kết cấu của ý thức',
            '3': 'Mối quan hệ giữa vật chất và ý thức'
        },
        'II': {
            '1': 'Hai loại hình biện chứng và phép biện chứng duy vật',
            '2': 'Nội dung của phép biện chứng duy vật'
        },
        'III': {
            '1': 'Quan niệm về nhận thức trong lịch sử triết học',
            '2': 'Lý luận nhận thức duy vật biện chứng'
        }
    },
    'Chương 3': {
        'I': {
            '1': 'Sản xuất vật chất là cơ sở của sự tồn tại và phát triển xã hội',
            '2': 'Biện chứng giữa lực lượng sản xuất và quan hệ sản xuất',
            '3': 'Biện chứng giữa cơ sở hạ tầng và kiến trúc thượng tầng',
            '4': 'Sự phát triển các hình thái kinh tế - xã hội là một quá trình lịch sử - tự nhiên'
        },
        'II': {
            '1': 'Giai cấp và đấu tranh giai cấp',
            '2': 'Dân tộc',
            '3': 'Mối quan hệ giai cấp - dân tộc - nhân loại'
        },
        'III': {
            '1': 'Nhà nước',
            '2': 'Cách mạng xã hội'
        },
        'IV': {
            '1': 'Khái niệm tồn tại xã hội và các yếu tố cơ bản của tồn tại xã hội',
            '2': 'Khái niệm, kết cấu, tính giai cấp, các hình thái của ý thức xã hội',
            '3': 'Quan hệ biện chứng giữa tồn tại xã hội và ý thức xã hội'
        },
        'V': {
            '1': 'Con người và bản chất con người',
            '2': 'Hiện tượng tha hóa con người và vấn đề giải phóng con người',
            '3': 'Quan điểm về quan hệ cá nhân - xã hội và vai trò quần chúng',
            '4': 'Vấn đề con người trong sự nghiệp cách mạng ở Việt Nam'
        }
    }
};

/**
 * Get display name for a chapter.
 */
export function getChapterDisplayName(chapterCode) {
    return CHAPTER_NAMES[chapterCode] || chapterCode;
}

/**
 * Get display name for a section (Roman numeral) under a specific chapter.
 */
export function getSectionDisplayName(chapterCode, sectionCode) {
    return SECTION_NAMES[chapterCode]?.[sectionCode] || `Mục ${sectionCode}`;
}

/**
 * Get display name for a part (number) under a specific chapter and section.
 */
export function getPartDisplayName(chapterCode, sectionCode, partCode) {
    const title = PART_NAMES[chapterCode]?.[sectionCode]?.[partCode];
    return title ? `Phần ${partCode}: ${title}` : `Phần ${partCode}`;
}
