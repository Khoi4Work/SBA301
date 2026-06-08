import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowLeft, 
    Wallet, 
    Sparkles, 
    Brain, 
    Award, 
    Loader2, 
    RefreshCw, 
    TrendingUp, 
    BookOpen,
    Trophy,
    Smile,
    Heart,
    Users
} from 'lucide-react';
import apiClient from '@/services/apiClient';
import { Sidebar } from '@/components/Sidebar';
import Footer from '@/components/Footer';

// Define the 10 rounds of the game
const SCENARIOS = [
    {
        id: 1,
        title: "Vòng 1: Nhận tiền sinh hoạt & Cám dỗ ăn uống",
        text: "Bạn vừa nhận được khoản tiền sinh hoạt tháng đầu tiên từ bố mẹ gửi (5.000.000 VNĐ). Tối hôm đó, đám bạn mới rủ đi ăn lẩu nướng tại một nhà hàng buffet sang chảnh và đi hát karaoke để check-in chào mừng cuộc sống sinh viên tự do.",
        choices: [
            {
                text: "Đi luôn chứ ngại gì! Sẵn sàng chi 1.500.000 VNĐ cho bữa tối buffet lẩu sang chảnh để có ảnh đẹp đăng Instagram kèm định vị quán để tạo ấn tượng sành điệu.",
                prestigeDiff: 30,
                wisdomDiff: -10,
                budgetDiff: -1500000,
                happinessDiff: 40,
                healthDiff: -5,
                socialDiff: 25,
                summary: "Chi 1.500.000 VNĐ ăn lẩu sang chảnh để lấy ảnh check-in sống ảo."
            },
            {
                text: "Từ chối khéo tiệc sang, rủ cả nhóm hôm khác đi ăn quán lẩu vỉa hè bình dân gần trường học với chi phí chỉ 150.000 VNĐ mỗi người, vừa ấm cúng vừa tiết kiệm.",
                prestigeDiff: 5,
                wisdomDiff: 10,
                budgetDiff: -150000,
                happinessDiff: 15,
                healthDiff: 10,
                socialDiff: 20,
                summary: "Từ chối tiệc sang, đi ăn quán lẩu vỉa hè bình dân cùng bạn bè."
            },
            {
                text: "Từ chối tiệc tùng xô bồ, ở nhà tự nấu cơm đơn giản hết 50.000 VNĐ và dành thời gian nghiên cứu chương 'Sự sùng bái hàng hóa' trong bộ sách 'Tư bản' của Marx.",
                prestigeDiff: 0,
                wisdomDiff: 30,
                budgetDiff: -50000,
                happinessDiff: -20,
                healthDiff: 20,
                socialDiff: -15,
                summary: "Ở nhà tự nấu ăn đơn giản và đọc nghiên cứu tác phẩm 'Tư bản'."
            }
        ]
    },
    {
        id: 2,
        title: "Vòng 2: Áp lực nâng cấp thiết bị công nghệ",
        text: "Điện thoại cũ của bạn bắt đầu đơ giật. Chiếc iPhone mới nhất đang là trào lưu cực hot trong giới trẻ, cầm trên tay là auto đẳng cấp. Một cửa hàng đưa ra chính sách mua trả góp 0% lãi suất, chỉ cần trả 1.500.000 VNĐ/tháng.",
        choices: [
            {
                text: "Quyết định mua trả góp chiếc iPhone Pro Max mới nhất với giá 1.500.000 VNĐ mỗi tháng, tự tin cầm máy sang chảnh đi selfie để khẳng định vị thế và đẳng cấp.",
                prestigeDiff: 60,
                wisdomDiff: -10,
                budgetDiff: -1500000,
                happinessDiff: 50,
                healthDiff: -10,
                socialDiff: 15,
                summary: "Mua trả góp điện thoại iPhone Pro Max thời thượng đắt tiền để sống ảo."
            },
            {
                text: "Mua một chiếc điện thoại tầm trung cũ giá 4.000.000 VNĐ đáp ứng tốt nhu cầu học tập, tra cứu tài liệu học tập, liên lạc ổn định mà không lo gánh nặng tài chính.",
                prestigeDiff: 10,
                wisdomDiff: 15,
                budgetDiff: -4000000,
                happinessDiff: 10,
                healthDiff: 0,
                socialDiff: 5,
                summary: "Mua điện thoại tầm trung cũ giá rẻ đủ đáp ứng nhu cầu học tập."
            },
            {
                text: "Vẫn dùng điện thoại cũ và tự tối ưu phần mềm để dùng mượt mà hơn, dùng số tiền định nâng cấp để đầu tư mua thêm sách chuyên ngành phục vụ phát triển học vấn.",
                prestigeDiff: 0,
                wisdomDiff: 30,
                budgetDiff: 0,
                happinessDiff: -15,
                healthDiff: 10,
                socialDiff: -10,
                summary: "Giữ điện thoại cũ, cài lại máy và dành tiền đầu tư mua tài liệu tự học."
            }
        ]
    },
    {
        id: 3,
        title: "Vòng 3: Cạm bẫy 'Việc nhẹ lương cao' & Làm KOL ảo",
        text: "Một công ty truyền thông đề xuất bạn ký hợp đồng làm KOL 'phông bạt' trên mạng xã hội. Bạn sẽ được thuê xe sang, chụp ảnh ở biệt thự mượn để đóng vai tổng tài thành đạt nhằm quảng bá cho một ứng dụng đầu tư tài chính ảo.",
        choices: [
            {
                text: "Ký hợp đồng làm KOL ảo quảng bá app tài chính đa cấp để nhận ngay 2.000.000 VNĐ tiền cát-xê đầu tiên, chụp ảnh check-in xe sang mượn để tạo uy tín giả tạo.",
                prestigeDiff: 80,
                wisdomDiff: -30,
                budgetDiff: 2000000,
                happinessDiff: 20,
                healthDiff: -25,
                socialDiff: -30,
                summary: "Ký hợp đồng làm KOL phông bạt quảng bá dự án lừa đảo tài chính ảo."
            },
            {
                text: "Từ chối công việc KOL ảo đó, tìm việc làm gia sư dạy học thực chất kiếm thêm 1.500.000 VNĐ mỗi tháng, vừa có tiền tiêu vừa tích lũy kỹ năng sư phạm thực tế.",
                prestigeDiff: 10,
                wisdomDiff: 20,
                budgetDiff: 1500000,
                happinessDiff: -5,
                healthDiff: -10,
                socialDiff: 15,
                summary: "Làm gia sư dạy học bán thời gian để kiếm thêm thu nhập thực chất."
            },
            {
                text: "Từ chối thẳng thừng việc làm màu, tập trung toàn bộ thời gian tham gia nhóm nghiên cứu khoa học của trường về sự tha hóa của con người trong thời đại số.",
                prestigeDiff: 0,
                wisdomDiff: 40,
                budgetDiff: 0,
                happinessDiff: -10,
                healthDiff: -5,
                socialDiff: 20,
                summary: "Từ chối KOL ảo, tham gia nhóm nghiên cứu khoa học triết học của khoa."
            }
        ]
    },
    {
        id: 4,
        title: "Vòng 4: Kỳ nghỉ hè & Du lịch sang chảnh",
        text: "Mùa hè đến, Instagram ngập tràn ảnh check-in hồ bơi vô cực ở resort. Bạn bè rủ bạn đi tour du lịch Bali sống ảo 5 ngày với chi phí 10.000.000 VNĐ. Bạn có thể dùng thẻ tín dụng sinh viên hạn mức 15.000.000 VNĐ mới được cấp.",
        choices: [
            {
                text: "Quẹt thẻ tín dụng sinh viên đi du lịch Bali 5 ngày hết 10.000.000 VNĐ để có những bức ảnh check-in hồ bơi vô cực sang chảnh bằng bạn bằng bè trên mạng xã hội.",
                prestigeDiff: 80,
                wisdomDiff: -15,
                budgetDiff: -10000000,
                happinessDiff: 60,
                healthDiff: 10,
                socialDiff: 10,
                summary: "Quẹt nợ thẻ tín dụng du lịch Bali sang chảnh để chụp ảnh check-in."
            },
            {
                text: "Chọn chuyến đi phượt dã ngoại bằng xe máy cùng nhóm bạn thân về vùng quê thanh bình với chi phí chỉ 1.000.000 VNĐ, trải nghiệm thiên nhiên chân thực và vui vẻ.",
                prestigeDiff: 20,
                wisdomDiff: 20,
                budgetDiff: -1000000,
                happinessDiff: 30,
                healthDiff: 5,
                socialDiff: 30,
                summary: "Đi phượt dã ngoại vùng ven cùng nhóm bạn thân thiết với chi phí rẻ."
            },
            {
                text: "Đăng ký làm chiến sĩ tình nguyện chiến dịch Mùa hè xanh tại vùng cao xa xôi, tự đóng tiền ăn 200.000 VNĐ để cống hiến sức trẻ và thấu hiểu đời sống nhân dân.",
                prestigeDiff: 5,
                wisdomDiff: 50,
                budgetDiff: -200000,
                happinessDiff: 10,
                healthDiff: -15,
                socialDiff: 40,
                summary: "Tham gia chiến dịch tình nguyện Mùa Hè Xanh vùng sâu vùng xa."
            }
        ]
    },
    {
        id: 5,
        title: "Vòng 5: Áp lực kỳ thi học kỳ & Đồ án môn học",
        text: "Tuần sau là kỳ thi môn Triết học và nộp đồ án chuyên ngành quan trọng. Bạn đang quá tải. Trên hội nhóm có dịch vụ viết thuê đồ án cam kết điểm A giá 2.000.000 VNĐ và bán tài liệu phao thi giá 200.000 VNĐ.",
        choices: [
            {
                text: "Chi 2.200.000 VNĐ thuê người viết hộ đồ án tốt nghiệp và mua phao thi để có bảng điểm đẹp lung linh đăng Facebook, dành thời gian đó để đi chơi và chụp ảnh.",
                prestigeDiff: 50,
                wisdomDiff: -40,
                budgetDiff: -2200000,
                happinessDiff: 20,
                healthDiff: 15,
                socialDiff: -20,
                summary: "Chi tiền thuê viết đồ án và mua tài liệu gian lận thi cử."
            },
            {
                text: "Chấp nhận thức đêm ôn thi và tự tay hoàn thành đồ án tốt nghiệp, đạt kết quả điểm B thực chất nhờ sự nỗ lực tự thân và nắm vững nền tảng kiến thức chuyên môn.",
                prestigeDiff: 10,
                wisdomDiff: 25,
                budgetDiff: 0,
                happinessDiff: -25,
                healthDiff: -30,
                socialDiff: 10,
                summary: "Tự học chăm chỉ thâu đêm và tự làm đồ án tốt nghiệp đạt điểm B."
            },
            {
                text: "Tập trung nghiên cứu sâu tài liệu để viết bài đồ án mang tính phản biện độc đáo, xuất sắc đạt điểm A bằng chính năng lực tư duy khoa học độc lập của mình.",
                prestigeDiff: 5,
                wisdomDiff: 50,
                budgetDiff: 0,
                happinessDiff: -15,
                healthDiff: -20,
                socialDiff: 15,
                summary: "Viết đồ án nghiên cứu lý luận phản biện sâu sắc đạt điểm A xuất sắc."
            }
        ]
    },
    {
        id: 6,
        title: "Vòng 6: Thời trang FOMO & Mua sắm quần áo",
        text: "Các hãng thời trang liên tục tung ra bộ sưu tập mới phối hợp với các KOL nổi tiếng. Mọi người xung quanh đều khoác lên mình các trang phục bắt trend thời thượng, khiến bạn cảm thấy tủ đồ của mình thật lỗi thời.",
        choices: [
            {
                text: "Quyết định chi 3.000.000 VNĐ mua đôi giày hiệu đang là xu hướng nóng để diện khi đi chơi, thu hút ánh nhìn ngưỡng mộ của bạn bè cùng khóa về độ sành điệu.",
                prestigeDiff: 50,
                wisdomDiff: -5,
                budgetDiff: -3000000,
                happinessDiff: 40,
                healthDiff: 0,
                socialDiff: 15,
                summary: "Chi tiền mua sắm giày sneaker hàng hiệu đắt tiền theo trào lưu."
            },
            {
                text: "Mua quần áo local brand hoặc đồ cũ giá rẻ khoảng 500.000 VNĐ, phối đồ năng động và cá tính để tự tin đi học mà không cần đua đòi theo các trào lưu xa xỉ.",
                prestigeDiff: 15,
                wisdomDiff: 10,
                budgetDiff: -500000,
                happinessDiff: 15,
                healthDiff: 0,
                socialDiff: 10,
                summary: "Mua sắm quần áo secondhand đơn giản, phối đồ phong cách cá nhân."
            },
            {
                text: "Tiếp tục mặc các trang phục cũ gọn gàng sạch sẽ, dành thời gian chăm sóc tâm hồn và bỏ qua mọi áp lực phải liên tục mua sắm theo trào lưu tiêu dùng hiện đại.",
                prestigeDiff: 0,
                wisdomDiff: 20,
                budgetDiff: 0,
                happinessDiff: -20,
                healthDiff: 5,
                socialDiff: -10,
                summary: "Giữ quan điểm mặc đồ cũ sạch sẽ gọn gàng, từ chối thời trang FOMO."
            }
        ]
    },
    {
        id: 7,
        title: "Vòng 7: Chọn hoạt động rèn luyện thể chất",
        text: "Để duy trì vóc dáng và sức khỏe, bạn cần tập luyện. Một trung tâm thể hình cao cấp mới mở tặng voucher giảm giá thẻ hội viên nhưng chi phí vẫn rất đắt đỏ, hứa hẹn là địa điểm check-in sang chảnh nhất.",
        choices: [
            {
                text: "Đăng ký gói thẻ gym cao cấp 5 sao giá 2.000.000 VNĐ mỗi tháng để có chỗ tập máy lạnh hiện đại và tiện lợi cho việc chụp ảnh check-in phòng tập sang chảnh.",
                prestigeDiff: 40,
                wisdomDiff: 0,
                budgetDiff: -2000000,
                happinessDiff: 30,
                healthDiff: 20,
                socialDiff: 10,
                summary: "Mua gói thẻ tập gym cao cấp 5 sao phục vụ mục đích check-in sống ảo."
            },
            {
                text: "Chọn chạy bộ rèn luyện sức khỏe ở công viên gần nhà và tập luyện miễn phí tại các khu thể thao công cộng ngoài trời, kết nối thêm nhiều bạn chạy bộ năng động.",
                prestigeDiff: 5,
                wisdomDiff: 15,
                budgetDiff: 0,
                happinessDiff: 10,
                healthDiff: 25,
                socialDiff: 15,
                summary: "Chạy bộ rèn luyện sức khỏe ở công viên ngoài trời và tập xà công cộng."
            },
            {
                text: "Tự rèn luyện thể chất khắc khổ bằng các bài tập calisthenics tại nhà không tốn phí, dành thời gian rảnh đọc sách triết học để bồi đắp tư duy lý luận biện chứng.",
                prestigeDiff: 0,
                wisdomDiff: 25,
                budgetDiff: 0,
                happinessDiff: -5,
                healthDiff: 15,
                socialDiff: -10,
                summary: "Tự tập thể chất calisthenics tại nhà riêng và đọc sách rèn lý tính."
            }
        ]
    },
    {
        id: 8,
        title: "Vòng 8: Hẹn hò tình cảm & Áp lực chi tiêu",
        text: "Bạn đang trong mối quan hệ tình cảm sinh viên ngọt ngào. Cuối tuần này là kỷ niệm 100 ngày yêu nhau. Các cặp đôi trên mạng đang đua nhau đăng ảnh tặng quà hiệu, ăn tối lãng mạn tại các nhà hàng đắt đỏ.",
        choices: [
            {
                text: "Hẹn hò tại một quán bar sang trọng trên tầng thượng Landmark, chi 2.500.000 VNĐ mua quà tặng đắt tiền để chứng tỏ bản thân là người yêu tâm lý và chịu chi.",
                prestigeDiff: 60,
                wisdomDiff: -10,
                budgetDiff: -2500000,
                happinessDiff: 50,
                healthDiff: -5,
                socialDiff: 25,
                summary: "Chi tiền hẹn hò lãng mạn trên tầng thượng Landmark và mua quà hiệu."
            },
            {
                text: "Rủ người yêu đi xem phim và ăn uống nhẹ nhàng tại các quán ăn vỉa hè ấm cúng hết khoảng 400.000 VNĐ, trò chuyện vui vẻ và thấu hiểu nhau hơn trong thực tế.",
                prestigeDiff: 10,
                wisdomDiff: 10,
                budgetDiff: -400000,
                happinessDiff: 30,
                healthDiff: 0,
                socialDiff: 20,
                summary: "Đi xem phim và ăn uống vỉa hè bình dân cùng người yêu cuối tuần."
            },
            {
                text: "Cùng nhau hẹn hò học nhóm tại thư viện trường, sau đó tự nấu bữa tối giản dị tại nhà hết 100.000 VNĐ, vừa chia sẻ tri thức vừa xây dựng tình cảm bền vững.",
                prestigeDiff: 0,
                wisdomDiff: 35,
                budgetDiff: -100000,
                happinessDiff: 20,
                healthDiff: 10,
                socialDiff: 30,
                summary: "Hẹn hò học tập tại thư viện và cùng tự nấu ăn đơn giản tại nhà."
            }
        ]
    },
    {
        id: 9,
        title: "Vòng 9: Cơ hội đầu cơ tiền điện tử coin rác",
        text: "Một nhóm chat rủ rê bạn tham gia đầu cơ vào một đồng tiền điện tử 'coin rác' mới ra mắt, hứa hẹn nhân 10 tài sản nhanh chóng. Rất nhiều bạn trẻ đang khoe ảnh chốt lời mua xe nhờ đồng coin này.",
        choices: [
            {
                text: "Dùng toàn bộ tiền tiết kiệm 4.000.000 VNĐ đầu cơ vào đồng tiền ảo rác đang được đồn thổi làm giàu nhanh chóng, hi vọng đổi đời chỉ sau một đêm mà không cần làm.",
                prestigeDiff: 40,
                wisdomDiff: -35,
                budgetDiff: -4000000,
                happinessDiff: 30,
                healthDiff: -20,
                socialDiff: -25,
                summary: "Đầu cơ tất tay tiền tiết kiệm vào sàn coin rác rủi ro cao."
            },
            {
                text: "Mang 1.000.000 VNĐ ra ngân hàng mở sổ tiết kiệm tích lũy an toàn dài hạn, thiết lập thói quen quản lý tài chính cá nhân khoa học và phòng ngừa rủi ro tương lai.",
                prestigeDiff: 0,
                wisdomDiff: 20,
                budgetDiff: -1000000,
                happinessDiff: 0,
                healthDiff: 5,
                socialDiff: 0,
                summary: "Gửi tiền tiết kiệm tích lũy an toàn tại ngân hàng thương mại."
            },
            {
                text: "Tránh xa mọi trò chơi đầu cơ tài chính ảo, trích ra 300.000 VNĐ mua các cuốn sách kinh điển của Karl Marx và Engels để củng cố thế giới quan duy vật biện chứng.",
                prestigeDiff: 0,
                wisdomDiff: 35,
                budgetDiff: -300000,
                happinessDiff: -5,
                healthDiff: 10,
                socialDiff: 0,
                summary: "Từ chối đầu cơ tài chính mạo hiểm, trích tiền mua sách triết học."
            }
        ]
    },
    {
        id: 10,
        title: "Vòng 10: Thực tập tốt nghiệp & Hướng đi tương lai",
        text: "Bạn chuẩn bị tốt nghiệp đại học. Bạn đứng trước các cơ hội lựa chọn nơi thực tập đầu đời để chuẩn bị làm bàn đạp cho sự nghiệp lâu dài sau này của bản thân.",
        choices: [
            {
                text: "Thực tập không lương tại tập đoàn đa quốc gia nổi tiếng để lấy cái mác trưởng phòng ảo đăng hồ sơ LinkedIn, chấp nhận gánh chịu áp lực lớn và chi phí sinh hoạt.",
                prestigeDiff: 70,
                wisdomDiff: 10,
                budgetDiff: 0,
                happinessDiff: -20,
                healthDiff: -30,
                socialDiff: 20,
                summary: "Thực tập không lương tại tập đoàn lớn lấy danh tiếng đăng hồ sơ ảo."
            },
            {
                text: "Chọn thực tập có lương 4.000.000 VNĐ mỗi tháng tại doanh nghiệp vừa và nhỏ, làm công việc thực chất để tích lũy kinh nghiệm nghề nghiệp thực tế quý giá.",
                prestigeDiff: 20,
                wisdomDiff: 25,
                budgetDiff: 4000000,
                happinessDiff: 10,
                healthDiff: -15,
                socialDiff: 15,
                summary: "Thực tập có lương tại doanh nghiệp vừa và nhỏ, làm việc thực chất."
            },
            {
                text: "Làm trợ lý nghiên cứu cho giáo sư trong khoa với học bổng 2.000.000 VNĐ mỗi tháng, trực tiếp tham gia đề tài học thuật để bồi đắp năng lực tư duy lý tính sâu.",
                prestigeDiff: 5,
                wisdomDiff: 50,
                budgetDiff: 2000000,
                happinessDiff: 15,
                healthDiff: -10,
                socialDiff: 30,
                summary: "Làm trợ lý nghiên cứu khoa học cho giáo sư để bồi đắp tư duy."
            }
        ]
    }
];

const PHILOSOPHICAL_QUOTES = [
    "\"Không có con đường hoàng lộ nào cho khoa học, và chỉ những ai không sợ mệt mỏi leo lên những con đường dốc đá của khoa học mới có cơ hội đạt được những đỉnh cao rực rỡ.\" — Karl Marx",
    "\"Tồn tại xã hội quyết định ý thức xã hội. Ý thức của con người không quyết định tồn tại của họ, trái lại, tồn tại xã hội của họ quyết định ý thức của họ.\" — Karl Marx",
    "\"Sự sùng bái hàng hóa biến mối quan hệ xã hội giữa con người thành mối quan hệ vật chất giữa các vật thể.\" — Karl Marx",
    "\"Những giá trị ảo ảnh của xã hội tiêu dùng là xiềng xích vô hình kìm hãm con người trong sự tha hóa tự nguyện.\" — Friedrich Engels",
    "\"Tri thức thực sự chỉ có được qua hoạt động thực tiễn và rèn luyện lý tính nghiêm túc.\" — Friedrich Engels"
];

export default function ConsumeristEscape() {
    const navigate = useNavigate();

    // Game states
    const [gameState, setGameState] = useState('start'); // start | play | loading | result | fail
    const [currentRound, setCurrentRound] = useState(0);
    const [budget, setBudget] = useState(5000000); // 5,000,000 VND initial
    const [prestige, setPrestige] = useState(0);
    const [wisdom, setWisdom] = useState(0);
    const [happiness, setHappiness] = useState(50);
    const [health, setHealth] = useState(100);
    const [social, setSocial] = useState(50);
    
    const [failureReason, setFailureReason] = useState(null); // bankruptcy | depression | hospitalization | isolation
    const [choicesHistory, setChoicesHistory] = useState([]);
    
    // Result states
    const [loadingMessage, setLoadingMessage] = useState(PHILOSOPHICAL_QUOTES[0]);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [apiError, setApiError] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleStartGame = () => {
        setBudget(5000000);
        setPrestige(0);
        setWisdom(0);
        setHappiness(50);
        setHealth(100);
        setSocial(50);
        setFailureReason(null);
        setChoicesHistory([]);
        setCurrentRound(0);
        setGameState('play');
    };

    const handleChoice = (choice) => {
        const nextBudget = budget + choice.budgetDiff;
        const nextPrestige = Math.max(0, prestige + choice.prestigeDiff);
        const nextWisdom = Math.max(0, wisdom + choice.wisdomDiff);
        const nextHappiness = Math.max(0, happiness + choice.happinessDiff);
        const nextHealth = Math.max(0, health + choice.healthDiff);
        const nextSocial = Math.max(0, social + choice.socialDiff);

        setBudget(nextBudget);
        setPrestige(nextPrestige);
        setWisdom(nextWisdom);
        setHappiness(nextHappiness);
        setHealth(nextHealth);
        setSocial(nextSocial);
        
        const updatedHistory = [...choicesHistory, choice.summary];
        setChoicesHistory(updatedHistory);

        // Check critical limits
        if (nextBudget <= 0) {
            setFailureReason('bankruptcy');
            setGameState('fail');
            return;
        }
        if (nextHappiness <= 0) {
            setFailureReason('depression');
            setGameState('fail');
            return;
        }
        if (nextHealth <= 0) {
            setFailureReason('hospitalization');
            setGameState('fail');
            return;
        }
        if (nextSocial <= 0) {
            setFailureReason('isolation');
            setGameState('fail');
            return;
        }

        if (currentRound < SCENARIOS.length - 1) {
            setCurrentRound(prev => prev + 1);
        } else {
            // End of game -> trigger analysis
            triggerGameAnalysis(nextPrestige, nextWisdom, nextBudget, nextHappiness, nextHealth, nextSocial, updatedHistory);
        }
    };

    const triggerGameAnalysis = async (finalPrestige, finalWisdom, finalBudget, finalHappiness, finalHealth, finalSocial, finalChoices) => {
        setGameState('loading');
        setApiError(false);
        
        // Rotate quotes in loading screen
        let quoteIndex = 0;
        const interval = setInterval(() => {
            quoteIndex = (quoteIndex + 1) % PHILOSOPHICAL_QUOTES.length;
            setLoadingMessage(PHILOSOPHICAL_QUOTES[quoteIndex]);
        }, 5000);

        try {
            const response = await apiClient.post('/games/escape/analyze', {
                prestige: finalPrestige,
                wisdom: finalWisdom,
                budget: finalBudget,
                happiness: finalHappiness,
                health: finalHealth,
                social: finalSocial,
                choices: finalChoices
            });

            const result = response.data?.result;
            setAnalysisResult(result);
            
            // Check if user info exists in localStorage and update their local XP cache
            const storedUser = localStorage.getItem("user");
            if (storedUser && result.newTotalXp) {
                const userObj = JSON.parse(storedUser);
                userObj.totalXp = result.newTotalXp;
                userObj.streak = (userObj.streak || 0) + 1;
                localStorage.setItem("user", JSON.stringify(userObj));
            }
            
            setGameState('result');
        } catch (err) {
            console.error("Failed to fetch game analysis:", err);
            setApiError(true);
            // Fallback result in case backend is offline
            generateFallbackResult(finalPrestige, finalWisdom, finalBudget, finalHappiness, finalHealth, finalSocial);
        } finally {
            clearInterval(interval);
        }
    };

    const generateFallbackResult = (finalPrestige, finalWisdom, finalBudget, finalHappiness, finalHealth, finalSocial) => {
        const total = finalPrestige + finalWisdom;
        const percentage = total > 0 ? Math.round((finalPrestige * 100) / total) : 0;
        
        let title, analysis, suggestion;
        if (percentage >= 80) {
            title = "KOL Ảo Vọng Phông Bạt (Bậc Thầy Làm Màu)";
            analysis = "Chào mừng đồng chí đến với thế giới của ảo vọng hàng hóa! Bằng cách dốc cạn hầu bao và vay nợ để đổi lấy những tràng pháo tay ảo trên không gian mạng, đồng chí đã tự biến mình thành một vật phẩm hoàn hảo của hệ tư tưởng tư bản hiện đại. Ý thức xã hội của đồng chí đã bị bóp méo hoàn toàn bởi sự sùng bái hàng hóa, coi giá trị trình diễn cao hơn giá trị sử dụng thực tế. Tồn tại xã hội của đồng chí hiện tại là một đống nợ nần, sức khỏe giảm sút và các mối quan hệ xã hội chân thực bị hủy hoại.";
            suggestion = "Đọc kỹ chương 'Sự sùng bái hàng hóa' trong tập 1 bộ 'Tư bản' của Karl Marx.";
        } else if (percentage >= 50) {
            title = "Kẻ Tha Hóa Của Xã Hội Tiêu Dùng (Nạn Nhân Trào Lưu)";
            analysis = "Đồng chí đang đứng ở ranh giới của sự thức tỉnh và sự lôi kéo. Dù nhận thức được tầm quan trọng của học tập, đồng chí vẫn không thể cưỡng lại hoàn toàn sức hấp dẫn từ các biểu tượng địa vị xã hội. Ý thức xã hội của đồng chí phản ánh sự xung đột giữa tư duy thực tế và áp lực đồng trang lứa. Đồng chí cần hiểu rằng, những trào lưu tiêu dùng đó chỉ là ảo ảnh tạm thời nhằm trục lợi từ sức lao động, thời gian và sức khỏe của đồng chí.";
            suggestion = "Xem chuyên đề bài học 'Tồn tại xã hội quyết định ý thức xã hội' trên ứng dụng.";
        } else if (percentage >= 20) {
            title = "Học Giả Thực Tế Kiên Định (Người Làm Chủ Thực Tại)";
            analysis = "Chúc mừng đồng chí! Đồng chí đã thể hiện một bản lĩnh lý tính đáng khen ngợi trước những cạm bẫy hào nhoáng của xã hội tiêu dùng. Bằng việc cân nhắc tài chính thực tế và tập trung vào các công việc tạo ra giá trị thực sự, ý thức xã hội của đồng chí đã phản ánh một tư duy lành mạnh, hướng nghiệp thực tế. Đồng chí hiểu rằng tồn tại xã hội bền vững được xây dựng trên sự tích lũy giá trị lao động và phát triển hài hòa thể chất, tinh thần.";
            suggestion = "Đọc tác phẩm 'Bản thảo kinh tế - triết học năm 1844' của Karl Marx.";
        } else {
            title = "Triết Gia Khắc Kỷ Biện Chứng (Nhà Tư Tưởng Độc Lập)";
            analysis = "Thật xuất sắc! Đồng chí là một triết gia khắc kỷ đích thực trong thời đại số. Việc đồng chí liên tục từ chối các cám dỗ phông bạt, dành toàn bộ thời gian đọc sách kinh điển, nghiên cứu khoa học và đi tình nguyện cống hiến xã hội đã chứng minh ý thức lý tính độc lập cao độ của đồng chí. Đồng chí đã biến tri thức thành công cụ phản biện mạnh mẽ để giải phóng bản thân khỏi xiềng xích của sự sùng bái hàng hóa.";
            suggestion = "Nghiên cứu sâu các tiểu luận chuyên đề lý luận của Friedrich Engels.";
        }

        const xpGained = Math.max(10, Math.min(50, Math.round(finalWisdom / 10)));
        setAnalysisResult({
            phongBatPercentage: percentage,
            title: title,
            analysis: analysis,
            rehabilitationSuggestion: suggestion,
            xpGained: xpGained,
            newTotalXp: 120 // mock total
        });
        setGameState('result');
    };

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary relative overflow-x-hidden">
            {/* Background grid and vignette */}
            <div className="noise-overlay fixed inset-0 z-[100] pointer-events-none" />
            <div className="vignette fixed inset-0 z-30 pointer-events-none" />
            <div className="fixed inset-0 bg-surface-dim pointer-events-none z-[-1]" />
            <div className="fixed inset-0 atmospheric-fog z-[1] pointer-events-none" />

            <Sidebar />

            <main className="md:ml-64 min-h-screen bg-surface flex flex-col justify-between">
                <div className="pt-24 px-4 md:px-12 py-12 flex-1 flex flex-col justify-center">
                    
                    <AnimatePresence mode="wait">
                        {/* 1. START GAME STATE */}
                        {gameState === 'start' && (
                            <motion.div 
                                key="start"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="max-w-2xl mx-auto text-center space-y-8 bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-8 md:p-12 relative backdrop-blur-md shadow-2xl"
                            >
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                
                                <div className="space-y-3">
                                    <span className="text-xs uppercase tracking-[0.3em] text-secondary font-bold block">
                                        Trò chơi nhập vai biện chứng
                                    </span>
                                    <h1 className="font-display text-4xl md:text-5xl font-black text-on-background tracking-tight bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent uppercase">
                                        Consumerist Escape
                                    </h1>
                                    <p className="text-xl text-on-surface-variant font-medium">
                                        Thoát Khỏi Ảo Vọng Tiêu Dùng
                                    </p>
                                </div>

                                <div className="border-y border-outline-variant/10 py-6 text-sm text-on-surface-variant text-justify leading-relaxed space-y-4">
                                    <p>
                                        Đồng chí vừa đặt chân vào cuộc sống sinh viên tự do đầy cạm bẫy. Các mạng xã hội đang lan truyền mạnh lối sống khoe của, tiêu dùng xa xỉ và ảo mộng nổi tiếng nhanh. Bố mẹ giao cho đồng chí quyền quản lý ví tiền và thời gian của mình.
                                    </p>
                                    <p>
                                        Mỗi quyết định đồng chí đưa ra sẽ ảnh hưởng trực tiếp đến 6 chỉ số: <strong>Ngân sách (Budget)</strong>, mức độ <strong>Phông bạt (Prestige)</strong>, điểm <strong>Lý tính (Wisdom)</strong>, độ <strong>Vui vẻ (Happiness)</strong>, mức <strong>Sức khỏe (Health)</strong> và <strong>Mối quan hệ thực tế (Social)</strong>. Hãy suy nghĩ biện chứng và cân bằng tất cả sinh mạng thiết yếu trước khi lựa chọn!
                                    </p>
                                </div>

                                {/* Starting stats visual block */}
                                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto bg-surface-container-high/40 rounded-xl p-4 border border-outline-variant/10">
                                    <div className="text-center">
                                        <Wallet className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                                        <span className="block text-xs font-bold text-on-surface">5.000.000 đ</span>
                                        <span className="text-[9px] text-outline uppercase font-semibold">Ngân sách</span>
                                    </div>
                                    <div className="text-center">
                                        <Sparkles className="w-5 h-5 mx-auto text-pink-500 mb-1" />
                                        <span className="block text-xs font-bold text-on-surface">0</span>
                                        <span className="text-[9px] text-outline uppercase font-semibold">Phông bạt</span>
                                    </div>
                                    <div className="text-center">
                                        <Brain className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                                        <span className="block text-xs font-bold text-on-surface">0</span>
                                        <span className="text-[9px] text-outline uppercase font-semibold">Lý tính</span>
                                    </div>
                                    <div className="text-center border-t border-outline-variant/10 pt-2">
                                        <Smile className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
                                        <span className="block text-xs font-bold text-on-surface">50/100</span>
                                        <span className="text-[9px] text-outline uppercase font-semibold">Vui vẻ</span>
                                    </div>
                                    <div className="text-center border-t border-outline-variant/10 pt-2">
                                        <Heart className="w-5 h-5 mx-auto text-rose-500 mb-1" />
                                        <span className="block text-xs font-bold text-on-surface">100/100</span>
                                        <span className="text-[9px] text-outline uppercase font-semibold">Sức khỏe</span>
                                    </div>
                                    <div className="text-center border-t border-outline-variant/10 pt-2">
                                        <Users className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
                                        <span className="block text-xs font-bold text-on-surface">50/100</span>
                                        <span className="text-[9px] text-outline uppercase font-semibold">Quan hệ</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartGame}
                                    className="w-full sm:w-auto px-10 py-4 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                                >
                                    Vào hộp cát sinh tồn
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </button>
                            </motion.div>
                        )}

                        {/* 2. GAMEPLAY STATE */}
                        {gameState === 'play' && (
                            <motion.div
                                key="play"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="max-w-3xl mx-auto space-y-6"
                            >
                                {/* Stat floating header */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 rounded-2xl p-4 shadow-md sticky top-24 z-10">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    {/* 1. Ví tiền */}
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-outline uppercase block font-semibold">Ví tiền</span>
                                            <span className={`text-xs md:text-sm font-bold tracking-tight ${budget < 1000000 ? 'text-red-400 font-black' : 'text-on-surface'}`}>
                                                {formatCurrency(budget)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Phông bạt */}
                                    <div className="flex items-center justify-center gap-3 border-r md:border-x border-outline-variant/10">
                                        <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-outline uppercase block font-semibold">Phông bạt</span>
                                            <span className="text-xs md:text-sm font-bold text-pink-500 tracking-tight">{prestige}</span>
                                        </div>
                                    </div>

                                    {/* 3. Lý tính */}
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                            <Brain className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-outline uppercase block font-semibold">Lý tính</span>
                                            <span className="text-xs md:text-sm font-bold text-emerald-500 tracking-tight">{wisdom}</span>
                                        </div>
                                    </div>

                                    {/* 4. Vui vẻ */}
                                    <div className="flex items-center justify-center gap-3 border-t border-outline-variant/10 pt-3 md:pt-0">
                                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                                            <Smile className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-outline uppercase block font-semibold">Vui vẻ</span>
                                            <span className={`text-xs md:text-sm font-bold tracking-tight ${happiness < 20 ? 'text-red-400 font-black animate-pulse' : 'text-cyan-500'}`}>{happiness}/100</span>
                                        </div>
                                    </div>

                                    {/* 5. Sức khỏe */}
                                    <div className="flex items-center justify-center gap-3 border-t border-x border-outline-variant/10 pt-3 md:pt-0">
                                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                            <Heart className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-outline uppercase block font-semibold">Sức khỏe</span>
                                            <span className={`text-xs md:text-sm font-bold tracking-tight ${health < 30 ? 'text-red-400 font-black animate-pulse' : 'text-rose-500'}`}>{health}/100</span>
                                        </div>
                                    </div>

                                    {/* 6. Mối quan hệ */}
                                    <div className="flex items-center justify-center gap-3 border-t border-outline-variant/10 pt-3 md:pt-0">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-outline uppercase block font-semibold">Quan hệ</span>
                                            <span className={`text-xs md:text-sm font-bold tracking-tight ${social < 25 ? 'text-red-400 font-black animate-pulse' : 'text-indigo-400'}`}>{social}/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Scenario Card */}
                                <div className="bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl space-y-6 relative">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                                        <span className="text-xs uppercase tracking-widest text-secondary font-bold">
                                            Quyết định {currentRound + 1} / {SCENARIOS.length}
                                        </span>
                                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full">
                                            Tồn tại & Ý thức
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="font-display text-lg md:text-xl font-bold text-on-surface leading-tight">
                                            {SCENARIOS[currentRound].title}
                                        </h2>
                                        <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                            {SCENARIOS[currentRound].text}
                                        </p>
                                    </div>

                                    {/* Choices Grid */}
                                    <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                                        {SCENARIOS[currentRound].choices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleChoice(choice)}
                                                className="w-full text-left p-5 bg-surface-container-high/40 border border-outline-variant/10 hover:border-secondary hover:bg-secondary/5 rounded-xl text-sm font-medium text-on-surface hover:text-secondary leading-relaxed transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer flex gap-4"
                                            >
                                                <span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span>{choice.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. LOADING/PROCESSING STATE */}
                        {gameState === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="max-w-md mx-auto text-center space-y-6 bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 rounded-2xl p-8 shadow-2xl relative"
                            >
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="w-20 h-20 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                                    <Brain className="w-8 h-8 text-secondary absolute inset-0 m-auto animate-pulse" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-display text-xl font-bold text-on-background">Đang kết nối văn phòng triết học</h3>
                                    <p className="text-xs text-outline uppercase tracking-wider font-semibold">
                                        Karl Marx đang soạn lời phê biện chứng...
                                    </p>
                                </div>

                                <div className="bg-surface-container-high/30 rounded-xl p-5 border border-outline-variant/10 min-h-[100px] flex items-center justify-center">
                                    <p className="text-xs text-on-surface-variant italic leading-relaxed text-center font-medium max-w-sm">
                                        {loadingMessage}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* 4. RESULT STATE */}
                        {gameState === 'result' && analysisResult && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-3xl mx-auto space-y-8"
                            >
                                {/* Results header scorecard */}
                                <div className="bg-surface-container-low/70 border border-outline-variant/20 rounded-2xl p-8 text-center relative backdrop-blur-md shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    {/* Score circle */}
                                    <div className="relative w-36 h-36 mx-auto mb-6">
                                        {/* Radial Neon Progress Circle */}
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle 
                                                cx="50" cy="50" r="42" 
                                                className="stroke-outline-variant/10 fill-none" 
                                                strokeWidth="8"
                                            />
                                            <motion.circle 
                                                cx="50" cy="50" r="42" 
                                                className="stroke-pink-500 fill-none" 
                                                strokeWidth="8"
                                                strokeDasharray="264"
                                                initial={{ strokeDashoffset: 264 }}
                                                animate={{ strokeDashoffset: 264 - (264 * analysisResult.phongBatPercentage) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-pink-500 tracking-tight">{analysisResult.phongBatPercentage}%</span>
                                            <span className="text-[9px] text-outline font-bold uppercase tracking-wider">Độ phông bạt</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] text-outline uppercase tracking-widest font-bold">Danh hiệu của đồng chí:</span>
                                        <h2 className="font-display text-2xl md:text-3xl font-black text-on-surface tracking-tight bg-gradient-to-r from-pink-500 to-amber-500 bg-clip-text text-transparent uppercase leading-tight">
                                            {analysisResult.title}
                                        </h2>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-6 border-t border-outline-variant/10 pt-6">
                                        <div>
                                            <span className="block text-lg font-bold text-amber-500">{formatCurrency(budget)}</span>
                                            <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Ví tiền</span>
                                        </div>
                                        <div>
                                            <span className="block text-lg font-bold text-pink-500">{prestige}</span>
                                            <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Phông bạt</span>
                                        </div>
                                        <div>
                                            <span className="block text-lg font-bold text-emerald-500">{wisdom}</span>
                                            <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Lý tính</span>
                                        </div>
                                        <div className="border-t border-outline-variant/10 pt-3">
                                            <span className="block text-lg font-bold text-cyan-500">{happiness}/100</span>
                                            <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Vui vẻ</span>
                                        </div>
                                        <div className="border-t border-outline-variant/10 pt-3">
                                            <span className="block text-lg font-bold text-rose-500">{health}/100</span>
                                            <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Sức khỏe</span>
                                        </div>
                                        <div className="border-t border-outline-variant/10 pt-3">
                                            <span className="block text-lg font-bold text-indigo-400">{social}/100</span>
                                            <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Mối quan hệ</span>
                                        </div>
                                    </div>

                                    {/* XP Rewards card */}
                                    <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 font-bold text-xs">
                                        <Trophy className="w-4 h-4 animate-bounce" />
                                        Nhận được +{analysisResult.xpGained} XP thưởng học giả
                                    </div>
                                </div>

                                {/* AI diagnosis report */}
                                <div className="bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl space-y-6 relative">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                                        <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                                            <Award className="w-5 h-5 text-secondary" />
                                            Chẩn đoán triết học từ Karl Marx
                                        </h3>
                                    </div>

                                    <div className="text-sm text-on-surface-variant leading-relaxed text-justify space-y-4">
                                        {analysisResult.analysis.split('\n\n').map((para, i) => (
                                            <p key={i} className="first-letter:text-3xl first-letter:font-black first-letter:text-secondary first-letter:mr-2 first-letter:float-left">
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                    
                                    {/* Book / suggestion widget */}
                                    <div className="bg-surface-container-high/40 rounded-xl p-5 border border-outline-variant/10 flex items-start gap-4">
                                        <div className="p-3 bg-secondary/15 border border-secondary/20 rounded-xl text-secondary">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs uppercase tracking-widest text-outline font-bold">Đề xuất rèn luyện học giả:</h4>
                                            <p className="text-sm font-semibold text-on-surface leading-snug">
                                                {analysisResult.rehabilitationSuggestion}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Replay & academy navigation */}
                                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                    <button
                                        onClick={handleStartGame}
                                        className="flex-1 px-6 py-3.5 bg-surface-container-high border border-outline-variant/20 hover:border-secondary hover:bg-secondary/5 rounded-xl font-bold text-xs uppercase tracking-wider text-secondary transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98"
                                    >
                                        <RefreshCw className="w-4.5 h-4.5" />
                                        Thử thách lại
                                    </button>
                                    <button
                                        onClick={() => navigate('/review')}
                                        className="flex-1 px-6 py-3.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98"
                                    >
                                        Quay lại Ôn tập
                                        <ArrowLeft className="w-4.5 h-4.5 rotate-180" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 5. FAIL STATE */}
                        {gameState === 'fail' && (
                            <motion.div
                                key="fail"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="max-w-md mx-auto text-center space-y-6 bg-surface-container-low/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 shadow-2xl relative"
                            >
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500">
                                    <Heart className="w-8 h-8 animate-pulse text-red-500" />
                                </div>

                                <h3 className="font-display text-2xl font-black text-red-500 tracking-tight uppercase">
                                    Thất Bại Sinh Tồn!
                                </h3>

                                <div className="bg-surface-container-high/40 rounded-xl p-5 border border-outline-variant/10 text-sm text-on-surface-variant leading-relaxed text-justify">
                                    {failureReason === 'bankruptcy' && (
                                        <p>
                                            <strong>[Kịch bản Phá sản]:</strong> Số dư tài khoản của đồng chí đã chạm mức 0 hoặc âm. Đồng chí rơi vào cảnh nợ nần chồng chất, bị các tổ chức tín dụng đen rượt đuổi, không thể chi trả tiền trọ hay tiền ăn. Sự sùng bái hàng hóa và thói tiêu xài phông bạt đã đẩy đồng chí vào vòng xoáy nô dịch của nợ nần tư bản.
                                        </p>
                                    )}
                                    {failureReason === 'depression' && (
                                        <p>
                                            <strong>[Kịch bản Trầm cảm]:</strong> Chỉ số vui vẻ của đồng chí đã chạm đáy. Lối sống quá khắc khổ, từ chối mọi hoạt động giải trí hay giao tiếp bạn bè đã vắt kiệt tinh thần của đồng chí. Ý thức xã hội của đồng chí rơi vào trạng thái trầm cảm lâm sàng vì sự tồn tại thiếu vắng hoàn toàn những niềm vui cuộc sống.
                                        </p>
                                    )}
                                    {failureReason === 'hospitalization' && (
                                        <p>
                                            <strong>[Kịch bản Nhập viện]:</strong> Chỉ số sức khỏe thể chất của đồng chí đã về 0. Thức đêm liên tục để học tập, ăn uống quá kham khổ hoặc kiệt sức vì làm việc quá tải đã làm cơ thể đồng chí suy nhược nghiêm trọng. Đồng chí phải nhập viện cấp cứu để truyền dịch dinh dưỡng.
                                        </p>
                                    )}
                                    {failureReason === 'isolation' && (
                                        <p>
                                            <strong>[Kịch bản Cô lập xã hội]:</strong> Mối quan hệ thực tế của đồng chí đã biến mất hoàn toàn. Việc chỉ biết khoe của, phông bạt ảo hoặc tự cô lập bản thân để học tập đã khiến toàn bộ bạn bè rời xa. Đồng chí hoàn toàn đơn độc giữa giảng đường đại học, không có ai chia sẻ hay giúp đỡ khi gặp hoạn nạn.
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleStartGame}
                                        className="flex-1 px-6 py-3.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98"
                                    >
                                        <RefreshCw className="w-4.5 h-4.5" />
                                        Thử thách lại
                                    </button>
                                    <button
                                        onClick={() => navigate('/review')}
                                        className="flex-1 px-6 py-3.5 bg-surface-container-high border border-outline-variant/20 hover:border-secondary hover:bg-secondary/5 rounded-xl font-bold text-xs uppercase tracking-wider text-secondary transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98"
                                    >
                                        Quay lại Ôn tập
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
                <Footer />
            </main>
        </div>
    );
}
