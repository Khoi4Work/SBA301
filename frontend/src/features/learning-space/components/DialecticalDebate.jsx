import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowLeft, 
    Brain, 
    Award, 
    Loader2, 
    RefreshCw, 
    BookOpen,
    Trophy,
    ShieldAlert,
    Sword,
    Flame
} from 'lucide-react';
import apiClient from '@/services/apiClient.js';
import { Sidebar } from '@/components/Sidebar.jsx';
import Footer from '@/components/Footer.jsx';

// Starting brags of Dennis Flexer
const START_BRAGS = [
    "Tôi 18 tuổi đã tự mua xe sang nhờ làm clip nhảy nhảy và review sương sương trên mạng. Các bạn đi học đại học, nghiên cứu Triết học làm gì cho đau đầu rồi ra trường lương 5 củ? Tiền thực tế hơn học thức chứ!",
    "Mấy người cứ nói về nghiên cứu khoa học với tri thức nhân loại. Nhìn xem tôi chỉ cần livestream 2 tiếng chốt nghìn đơn, doanh thu bằng cả đời giáo sư đi dạy cộng lại. Xã hội thực dụng lắm các bạn ơi!",
    "Thời đại này ai còn quan tâm đạo đức với lý luận nữa? Có tiền sắm xe xịn, đồng hồ hiệu thì lời nói của bạn auto có sức nặng. Tri thức mà nghèo thì ai thèm nghe?",
    "Đi Bali check-in hồ bơi vô cực, ngồi khoang hạng nhất máy bay mới là đẳng cấp sống. Mấy quyển sách triết dày cộp có giúp các bạn có cuộc sống sang chảnh như thế này không?",
    "Học hành chăm chỉ rốt cuộc cũng chỉ để đi làm thuê cho các ông chủ tư bản. Sao không bỏ học đi làm streamer/KOL như tôi để tự làm chủ tài chính và tự do tiêu dùng từ sớm?"
];

// Pool of 15 debate scenarios with carefully balanced option lengths to prevent cheesing
const SCENARIOS_POOL = [
    {
        id: 1,
        opponentText: "Tôi làm clip nhảy nhảy review sương sương kiếm tiền tỷ mua xe. Mấy đứa học đại học làm gì cho đầu to mắt cận, ra trường lương 5 củ? Học thức sao đọ được với tiền mặt thực tế!",
        choices: [
            {
                text: "Đồng chí đang nhầm lẫn giữa giá trị sử dụng và giá trị trao đổi. Sự nổi tiếng của bạn là sản phẩm nhất thời của thuật toán nền kinh tế chú ý. Một xã hội chỉ dựa trên các clip ngắn giải trí mà thiếu vắng tri thức thực chất và sản xuất vật chất cốt lõi sẽ nhanh chóng suy thoái.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác KOL nhảy múa bằng lý luận giá trị sử dụng/trao đổi và sản xuất cốt lõi."
            },
            {
                text: "Đồng chí cần nhìn nhận thực tế rằng tỷ lệ đào thải của ngành sáng tạo nội dung là cực kỳ khắc nghiệt và thiếu tính bền vững. Việc theo đuổi học tập tại giảng đường đại học tuy không mang lại tiền bạc ngay lập tức nhưng giúp tích lũy một nền tảng tri thức hệ thống để phát triển lâu dài.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng tỷ lệ thất bại của KOL và sự an toàn của đại học."
            },
            {
                text: "Đồng chí chỉ đang ăn may nhờ trúng thuật toán của nền tảng mạng xã hội nhất thời chứ chẳng có tài năng thực chất gì đáng kể. Hãy chờ xem vài năm nữa khi trào lưu này đi qua và khán giả lãng quên, đồng chí sẽ xoay xở thế nào khi trong tay không có một tấm bằng đại học nào.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng cách công kích cá nhân ăn may và cảnh báo hết thời."
            }
        ]
    },
    {
        id: 2,
        opponentText: "Hạnh phúc thực sự là check-in resort 5 sao ở Bali, đắp đồ hiệu từ đầu đến chân cho thiên hạ trầm trồ. Mấy giá trị học thuật hay đạo đức khô khan của các người có mua nổi túi Hermes không?",
        choices: [
            {
                text: "Sự sùng bái hàng hóa đã tha hóa nhận thức của bạn, biến vật chất thành thước đo duy nhất cho phẩm giá con người. Hạnh phúc thực chất không nằm ở việc tiêu dùng hình ảnh để thỏa mãn ham muốn thừa nhận ảo, mà ở sự tự do phát triển toàn diện bản thân và cống hiến cho xã hội.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác KOL resort Bali bằng lý luận sùng bái hàng hóa và tha hóa trong xã hội tiêu dùng."
            },
            {
                text: "Đồng chí nên hiểu rằng đồ hiệu đắt tiền và những bức ảnh check-in Bali chỉ là vỏ bọc hào nhoáng tạm thời để che đậy sự trống rỗng trong tâm hồn. Tiền bạc có thể mua được những dịch vụ tiện nghi sang trọng nhất nhưng không bao giờ mua được sự bình an thực sự và những mối quan hệ chân thành.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng giới hạn của tiền bạc đối với hạnh phúc tâm hồn."
            },
            {
                text: "Lối sống khoe khoang xa xỉ của đồng chí chỉ nhằm mục đích thu hút sự chú ý và kích thích lòng ham muốn của đám đông tò mò. Sống giản dị, tiết kiệm và tránh xa các trào lưu tiêu dùng xa xỉ mới là cách sống thanh thản giúp con người tìm lại sự tự do đích thực trong cuộc sống.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng phê phán thói khoe của và khuyên sống giản dị."
            }
        ]
    },
    {
        id: 3,
        opponentText: "Xã hội bây giờ thực tế lắm, tiền quyết định tất cả! Ông bà ta nói 'Phú quý sinh lễ nghĩa', không có tiền thì tri thức hay đạo đức của các người cũng chỉ là giấy lộn mà thôi. Tiền mới là lực lượng thống trị!",
        choices: [
            {
                text: "Tiền tệ chỉ là vật ngang giá chung phản ánh quan hệ sản xuất. Nếu không có lao động thực tiễn tạo ra của cải vật chất và tri thức khoa học để cải tiến công cụ sản xuất, tiền của bạn sẽ vô giá trị. Tri thức khoa học và lao động thực tế mới chính là lực lượng sản xuất trực tiếp định hình xã hội.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác quan điểm 'tiền quyết định tất cả' bằng nguồn gốc giá trị từ lao động và lực lượng sản xuất."
            },
            {
                text: "Đồng chí quá thực dụng khi cho rằng tiền quyết định tất cả. Tiền bạc chỉ là phương tiện trao đổi chứ không phải là nền tảng đạo đức của xã hội. Nếu mọi người đều hành xử ích kỷ chỉ vì tiền mà chà đạp lên pháp luật thì xã hội sẽ hỗn loạn và tiền của bạn cũng mất an toàn.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng hậu quả của sự thực dụng vô đạo đức lên trật tự xã hội."
            },
            {
                text: "Lịch sử đã chứng minh tri thức và đạo đức của các vĩ nhân mới là thứ tồn tại vĩnh hằng cùng thời gian chứ không phải tiền bạc của những kẻ giàu có phông bạt. Sau hàng trăm năm, nhân loại vẫn tôn vinh các nhà tư tưởng vĩ đại trong khi những kẻ chỉ biết tích lũy tiền bạc đều bị lãng quên.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng cách so sánh danh tiếng vĩ nhân và người giàu phông bạt."
            }
        ]
    },
    {
        id: 4,
        opponentText: "Tôi đi phát quà từ thiện cho người nghèo nhưng phải có 3 thợ quay phim đi cùng, dựng clip nhạc buồn chèn logo tài trợ. Làm màu tí nhưng có view, có tiếng, lại được khấu trừ thuế. Từ thiện âm thầm làm gì có ai biết?",
        choices: [
            {
                text: "Đồng chí đang hàng hóa hóa lòng nhân ái, biến nỗi khổ của người khác thành phương tiện tích lũy vốn xã hội và danh tiếng cho bản thân. Hành vi từ thiện phông bạt này phản ánh sự tha hóa của đạo đức, nơi con người bị vật hóa làm công cụ truyền thông để phục vụ lợi ích kinh tế.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác từ thiện làm màu bằng lý luận hàng hóa hóa lòng nhân ái và tha hóa đạo đức."
            },
            {
                text: "Hành động từ thiện của đồng chí dù mang lại một số giá trị vật chất ngắn hạn cho người nghèo nhưng động cơ cá nhân quá lộ liễu sẽ làm mất đi giá trị nhân văn cốt lõi. Cộng đồng sẽ nhanh chóng quay lưng tẩy chay nếu phát hiện ra sự giả tạo đứng sau các chiến dịch làm màu đó.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng tác động thực tế của từ thiện làm màu và nguy cơ tẩy chay."
            },
            {
                text: "Từ thiện thực chất phải xuất phát từ sự đồng cảm chân thành và thực hiện một cách âm thầm kín đáo chứ không phải phô trương rầm rộ. Lối hành xử làm màu chụp ảnh của đồng chí chỉ chứng tỏ sự thiếu tôn trọng đối với người nhận và biến họ thành bàn đạp để trục lợi cá nhân.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng công kích cá nhân giả tạo và lợi dụng người nghèo."
            }
        ]
    },
    {
        id: 5,
        opponentText: "Tôi đi thuê xe sang chụp ảnh check-in rồi đăng bài dạy mọi người cách tự do tài chính, đầu tư sàn cỏ bao lời. Mấy ông giáo sư Triết học có mua nổi cái lốp xe của tôi không mà đòi dạy đời?",
        choices: [
            {
                text: "Bạn đang tạo dựng một ý thức giả tạo (false consciousness) để che đậy bản chất đầu cơ của mô hình lừa đảo tài chính. Bạn lấy vẻ hào nhoáng thuê mượn để che đậy sự trống rỗng về giá trị sản xuất thực chất, biến ảo ảnh tiêu dùng thành công cụ bóc lột niềm tin học viên.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác dạy làm giàu xe thuê bằng khái niệm ý thức giả tạo và bản chất đầu cơ."
            },
            {
                text: "Việc sử dụng hình ảnh siêu xe thuê mượn để dụ dỗ người khác tham gia đầu tư tài chính siêu lợi nhuận là hành vi thiếu đạo đức kinh doanh. Uy tín của một chuyên gia phải được khẳng định qua hiệu quả đầu tư thực chất và tính minh bạch lâu dài chứ không phải siêu xe.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng cảnh báo rủi ro pháp luật và giá trị của uy tín thực chất."
            },
            {
                text: "Hành vi làm màu lừa dối của bạn sớm muộn gì cũng bị cộng đồng mạng bóc trần sự thật và phải chịu trách nhiệm nghiêm khắc trước pháp luật. Thật đáng xấu hổ khi lấy chiếc xe đi thuê ra để nổ to và dạy bảo những người lao động chân chính về cách làm giàu.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng công kích xe thuê lừa đảo và không biết xấu hổ."
            }
        ]
    },
    {
        id: 6,
        opponentText: "Thời đại này chỉ cần đẹp, phẫu thuật thẩm mỹ sang chảnh, chụp ảnh khoe body là có ngay nghìn follow và tài trợ. Đầu tư học hành chi cho cận thị và già người ra?",
        choices: [
            {
                text: "Đồng chí đang tự biến cơ thể mình thành một thứ hàng hóa đặc biệt để trao đổi lấy lượt tương tác và hợp đồng quảng cáo. Khi giá trị con người bị giảm xuống chỉ còn là hình thể chịu sự chi phối của thị trường tiêu dùng, bạn đã đánh mất tính chủ thể lý tính độc lập của mình.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác sùng bái ngoại hình bằng lý luận hàng hóa hóa cơ thể và đánh mất chủ thể lý tính."
            },
            {
                text: "Đồng chí nên nhớ rằng nhan sắc và tuổi trẻ là những giá trị hao mòn rất nhanh theo thời gian và không thể tái tạo. Chỉ có việc đầu tư vào tri thức, kỹ năng thực tế và tư duy phản biện mới giúp bạn duy trì năng lực cạnh tranh bền vững trong suốt cuộc đời.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng quy luật nhan sắc phai tàn và giá trị bền vững của tri thức."
            },
            {
                text: "Vẻ đẹp hình thể bên ngoài chỉ thu hút những sự chú ý hời hợt và mang tính nhất thời trên không gian mạng xã hội ảo. Một con người có sức hút thực sự phải được bồi đắp từ chiều sâu văn hóa, học vấn và đạo đức xã hội chứ không phải ba cái app lọc hình ảnh.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng chê bai đẹp nhân tạo/app lọc và đề cao vẻ đẹp đạo đức."
            }
        ]
    },
    {
        id: 7,
        opponentText: "Tôi vừa chi 10 triệu mua 100k follower và mắt xem livestream ảo. Có uy tín ảo này tôi bán hàng gì cũng đắt như tôm tươi. Tri thức hay chất lượng sản phẩm chả quan trọng bằng cái phông bạt bề ngoài này!",
        choices: [
            {
                text: "Sự sùng bái các chỉ số ảo phản ánh sự thống trị của giá trị trao đổi giả tạo đối với giá trị sử dụng thực tế. Bạn đang xây dựng một mô hình kinh doanh lừa dối hệ thống, lấy ảo ảnh của sự nổi tiếng để che đậy chất lượng sản phẩm kém cỏi và bóc lột người tiêu dùng.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác mua follower ảo bằng đối lập giữa giá trị trao đổi giả tạo và giá trị sử dụng thực tế."
            },
            {
                text: "Việc chi tiền mua lượng người theo dõi giả tạo chỉ mang lại vẻ uy tín bề ngoài chứ không tạo ra giá trị kinh doanh thực chất. Khách hàng thời đại số rất thông minh, họ sẽ nhanh chóng nhận ra chất lượng sản phẩm tồi tệ và quay lưng tẩy chay thương hiệu của bạn.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng thực tế sụp đổ thương hiệu khi chất lượng sản phẩm tồi tệ."
            },
            {
                text: "Hành vi gian lận lượt tương tác ảo của bạn là sự thiếu trung thực trong kinh doanh và vi phạm tiêu chuẩn của các nền tảng mạng xã hội. Sớm muộn gì hệ thống cũng sẽ quét sạch những tài khoản giả mạo đó và để lại sự thất bại ê chề cho mô hình sống ảo của bạn.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng công kích gian lận rẻ tiền và đe dọa bị quét tài khoản."
            }
        ]
    },
    {
        id: 8,
        opponentText: "Ngân hàng cấp cho tôi thẻ tín dụng hạn mức 20 triệu. Tôi quẹt mua ngay đôi giày hiệu 15 triệu đi quẩy cho oai. Trả góp lo gì, đời sinh viên là phải rực rỡ và phô trương!",
        choices: [
            {
                text: "Đồng chí đang tự nguyện tròng vào cổ chiếc xích của sự tha hóa tín dụng. Xã hội tiêu dùng kích thích các ham muốn giả tạo để biến sức lao động tương lai của đồng chí thành lợi nhuận cho các tập đoàn tài chính, cướp đi sự tự do lựa chọn và khả năng phát triển của bạn.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác quẹt thẻ mua giày hiệu bằng lý luận tha hóa tín dụng và ham muốn giả tạo."
            },
            {
                text: "Việc lạm dụng thẻ tín dụng để chi tiêu vượt quá năng lực tài chính chỉ nhằm mục đích phô trương nhất thời với bạn bè là sự thiếu chín chắn. Những khoản nợ lãi suất cao sẽ đè nặng lên vai bạn suốt thời sinh viên, làm mất đi sự chủ động trong cuộc sống.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng tác hại của nợ nần thực tế và mất tự do sinh hoạt."
            },
            {
                text: "Sự phô trương sành điệu bằng tiền nợ của ngân hàng không chứng minh đồng chí là người có đẳng cấp mà chỉ cho thấy sự thiếu kiểm soát. Hãy học cách tích lũy tài chính thực tế và đầu tư vào những giá trị thiết thực cho việc học tập thay vì đua đòi hàng hiệu ảo.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng công kích thiếu suy nghĩ và thích làm màu."
            }
        ]
    },
    {
        id: 9,
        opponentText: "Tôi check-in văn phòng Landmark hằng ngày, mặc suit lịch lãm đăng quote tiếng Anh truyền cảm hứng. Dù chỉ là thực tập sinh không lương pha trà rót nước, nhưng cái phông bạt này đủ để mọi người nể phục!",
        choices: [
            {
                text: "Đồng chí đang chịu sự bóc lột giá trị thặng dư kép của chủ nghĩa tư bản hiện đại: vừa hiến dâng sức lao động không lương để tạo ra giá trị thực tế, vừa tự nguyện làm công cụ quảng bá hình ảnh miễn phí cho tập đoàn chỉ để đổi lấy sự thừa nhận ảo về vị thế xã hội.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác thực tập sinh không lương sống ảo bằng khái niệm bóc lột thặng dư kép."
            },
            {
                text: "Đồng chí cần hiểu rằng danh tiếng của tòa nhà Landmark hay cái tên của tập đoàn đa quốc gia không làm tăng giá trị thực tế của bạn. Điều quyết định tương lai nghề nghiệp là những kỹ năng chuyên môn và kinh nghiệm thực tiễn bạn tích lũy được chứ không phải ảnh check-in.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng việc đề cao năng lực thực tế so với check-in văn phòng."
            },
            {
                text: "Pha trà rót nước không lương nhưng lại đăng quote tiếng Anh sang chảnh làm như mình là lãnh đạo cấp cao là sự lừa dối bản thân. Lối sống phông bạt này chỉ chứng tỏ sự thiếu tự tin vào năng lực thực chất và cố gắng bám víu vào những giá trị hào nhoáng bên ngoài.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng chế giễu việc làm không lương đi nổ to."
            }
        ]
    },
    {
        id: 10,
        opponentText: "Mấy người làm công nhân, shipper, dọn vệ sinh chân tay thật là kém cỏi, không biết tư duy làm giàu. Thời đại này phải ngồi phòng lạnh làm KOL kiếm tiền bằng nước bọt mới là đẳng cấp!",
        choices: [
            {
                text: "Bạn đang phủ nhận nền tảng tồn tại của toàn bộ đời sống xã hội. Lao động vật chất là tồn tại xã hội tiên quyết tạo ra của cái. Không có công nhân hay người giao hàng trực tiếp vận hành hạ tầng thực tế, thế giới truyền thông kiếm tiền bằng nước bọt của bạn sẽ sụp đổ lập tức.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác coi thường lao động chân tay bằng quy luật lao động vật chất là tồn tại xã hội tiên quyết."
            },
            {
                text: "Mọi hoạt động lao động chân chính đóng góp cho xã hội đều xứng đáng được tôn trọng bình đẳng. Việc kiếm được nhiều tiền hơn từ truyền thông không đồng nghĩa với việc bạn có quyền tự cho mình ở đẳng cấp cao hơn và hạ thấp phẩm giá của những người lao động chân tay.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng sự đóng góp xã hội của các nghề nghiệp và tôn trọng phẩm giá lao động."
            },
            {
                text: "Lối tư duy kiêu ngạo coi thường người lao động chân chính phản ánh sự thiếu hụt nghiêm trọng về giáo dục nhân văn. Hãy thử tưởng tượng một ngày xã hội thiếu đi những người dọn rác hay shipper giao đồ ăn, cuộc sống tiện nghi sang chảnh của bạn sẽ trở nên tồi tệ thế nào.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng công kích kiêu ngạo và giả định thiếu shipper/lao công."
            }
        ]
    },
    {
        id: 11,
        opponentText: "Tôi mở lớp dạy làm giàu 'Đánh thức triệu phú' giá 5 triệu/khóa. Tôi chẳng cần kiến thức gì cao siêu, cứ nói đạo lý đạo đức giả và khoe ảnh chụp với siêu xe là học viên tự nộp tiền. Kiếm tiền dễ thế tội gì phải học hành vất vả?",
        choices: [
            {
                text: "Đồng chí đang thực hiện hành vi lừa bịp ý thức hệ, lợi dụng sự khó khăn kinh tế và tâm lý sốt ruột của người khác để trục lợi. Bạn dùng một hệ tư tưởng giả tạo về sự thành công cá nhân để che đậy và bóc lột tài chính của những người lao động nhẹ dạ cả tin.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác khóa học làm giàu bằng khái niệm lừa bịp ý thức hệ và bóc lột tài chính."
            },
            {
                text: "Việc sử dụng các mánh khoe khoe của để lừa gạt học viên đóng tiền học làm giàu nhanh chóng là hành vi vi phạm nghiêm trọng đạo đức kinh doanh. Một chuyên gia thực thụ phải truyền tải tri thức khoa học thực tế được kiểm chứng chứ không phải bán những ảo tưởng vô căn cứ.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng hậu quả vạch trần lừa đảo và đề cao giá trị thật."
            },
            {
                text: "Hành vi lừa đảo bằng cách nói đạo lý giả tạo của bạn sớm muộn gì cũng bị pháp luật can thiệp và xã hội lên án mạnh mẽ. Kiếm tiền trên sự ngây thơ và hoàn cảnh khó khăn của người khác là điều vô đạo đức và bạn sẽ phải trả giá đắt cho hành vi của mình.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng chửi bới vô đạo đức và đe dọa quả báo tâm linh."
            }
        ]
    },
    {
        id: 12,
        opponentText: "Tôi học trường quốc tế học phí trăm triệu, nói tiếng Anh như gió, đi du lịch nước ngoài như đi chợ. Mấy đứa học trường công, trường thường nghèo nàn làm sao có cửa so sánh đẳng cấp với tôi?",
        choices: [
            {
                text: "Sự ưu thế về giáo dục của bạn chỉ phản ánh sự bất bình đẳng trong phân chia tư liệu sản xuất và đặc quyền giai cấp của gia đình bạn, chứ không chứng minh năng lực cá nhân hay phẩm giá vượt trội. Đừng lấy đặc quyền thừa kế làm thước đo đẳng cấp bản thân.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác coi thường trường công bằng lý luận bất bình đẳng tư liệu sản xuất và đặc quyền thừa kế."
            },
            {
                text: "Môi trường học tập đắt đỏ chỉ là công cụ hỗ trợ bên ngoài, sự thành công thực chất trong cuộc sống và học vấn phụ thuộc hoàn toàn vào nỗ lực tự học và rèn luyện của mỗi người chứ không phải số học phí trăm triệu mà gia đình bạn đang chi trả hàng tháng.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng vai trò quyết định của nỗ lực tự học cá nhân."
            },
            {
                text: "Khoe khoang học phí đắt đỏ và phân biệt đối xử với các học sinh trường công lập chỉ thể hiện sự kém cỏi trong nhận thức văn hóa của bạn. Hãy tự mình lao động và tự kiếm tiền đóng học phí trước khi lên mặt so sánh đẳng cấp với những người bạn đồng trang lứa.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng thách thức tự đóng học phí."
            }
        ]
    },
    {
        id: 13,
        opponentText: "Tôi mới ra trường đã được xếp vào ghế trưởng phòng tập đoàn gia đình. Mấy người học giỏi Triết học hay chuyên ngành cho lắm vào rồi cũng chỉ làm nhân viên dưới quyền tôi. Quan hệ gia thế quyết định tất cả!",
        choices: [
            {
                text: "Vị trí của bạn là sự kế thừa đặc quyền tư hữu tư liệu sản xuất gia đình, phản ánh sự bất công của cấu trúc xã hội tư bản. Vị thế thống trị đó không chứng minh sự tiến bộ về trí tuệ hay đạo đức của bạn mà chỉ là sự tiếp nối của sự bóc lột giá trị thặng dư.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác thăng tiến gia thế bằng lý luận tư hữu tư liệu sản xuất và cấu trúc bất công."
            },
            {
                text: "Đặc quyền gia thế giúp bạn có điểm xuất phát cao hơn người khác nhưng nếu thiếu năng lực lãnh đạo thực chất và sự thấu hiểu chuyên môn, bạn sẽ sớm đưa doanh nghiệp gia đình đến bờ vực phá sản và đánh mất toàn bộ di sản mà thế hệ trước để lại.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng rủi ro sụp đổ di sản khi thiếu năng lực quản trị."
            },
            {
                text: "Dựa hơi vào quan hệ gia đình để thăng tiến nhưng lại huênh hoang tự đắc là sự thiếu trưởng thành. Hãy thử tự mình bước ra ngoài xã hội nộp CV ứng tuyển và cạnh tranh công bằng xem có đủ năng lực để làm việc dưới trướng người khác hay không.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng thách thức tự đi xin việc bằng năng lực thật."
            }
        ]
    },
    {
        id: 14,
        opponentText: "Tôi chỉ cần mua mấy đồng coin rác rồi đi ngủ, sáng dậy tài khoản nhân đôi. Mấy người công nhân làm lụng vất vả hay học giả nghiên cứu triết lý chỉ là lũ lười tư duy làm giàu, ôm khư khư học thuyết giá trị lao động lỗi thời!",
        choices: [
            {
                text: "Đồng chí đang tham gia vào trò chơi đầu cơ tài chính phi sản xuất. Mọi sự gia tăng tài khoản ở sàn coin rác không tạo ra giá trị mới mà chỉ là sự phân phối lại giá trị thặng dư được tạo ra bởi lao động thực tế. Thuyết giá trị lao động vẫn là quy luật chi phối nền kinh tế thực.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác đầu cơ coin rác bằng thuyết giá trị lao động và phân phối lại thặng dư."
            },
            {
                text: "Đầu cơ tiền điện tử thực chất là trò chơi tài chính mạo hiểm có tổng bằng không. Việc làm giàu nhanh chóng nhờ may rủi chỉ là nhất thời và chứa đựng rủi ro trắng tay cực lớn, hoàn toàn không thể thay thế cho sự tích lũy tài sản bền vững dựa trên sản xuất thực tế.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng rủi ro bong bóng tài chính vỡ và trò chơi tổng bằng không."
            },
            {
                text: "Lối tư duy kiếm tiền bằng cách đầu cơ may rủi rồi coi thường người lao động chân chính là biểu hiện của sự lệch lạc giá trị sống. Sớm muộn bong bóng tài chính ảo vỡ tan sẽ dạy cho bạn một bài học vô cùng đắt giá về giá trị thực chất của sức lao động xã hội.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng chửi bới đánh bạc đỏ đen và đe dọa trắng tay."
            }
        ]
    },
    {
        id: 15,
        opponentText: "Tôi có tài khoản triệu follow nên các nhãn hàng tranh nhau tài trợ nước hoa, mỹ phẩm đắt tiền để tôi quảng cáo. Tôi chẳng cần quan tâm chất lượng sản phẩm tốt hay xấu, cứ có tiền tài trợ là tôi khen lấy khen để thôi. View mới là chân lý!",
        choices: [
            {
                text: "Bạn đang biến uy tín cá nhân và lòng tin của cộng đồng thành một loại hàng hóa để mua bán. Hành vi quảng cáo gian dối này phản ánh sự tha hóa sâu sắc của ý thức xã hội trong thời đại số, nơi chân lý bị bẻ cong để phục vụ lợi ích tư bản tiêu dùng.",
                damageToOpponent: 12,
                damageToPlayer: 2,
                rating: "MẠNH (Biện chứng & Sâu sắc)",
                summary: "Phản bác KOL quảng cáo láo bằng khái niệm tha hóa lòng tin và bẻ cong chân lý vì lợi nhuận."
            },
            {
                text: "Việc nhận tiền tài trợ để quảng cáo sai sự thật về chất lượng sản phẩm là hành vi vi phạm đạo đức truyền thông nghiêm trọng. Khi người tiêu dùng nhận ra sự lừa dối, thương hiệu cá nhân của bạn sẽ sụp đổ vĩnh viễn và bị cộng đồng tẩy chay.",
                damageToOpponent: 8,
                damageToPlayer: 6,
                rating: "TRUNG BÌNH (Tư duy thực tế)",
                summary: "Phản bác bằng hậu quả hủy hoại danh tiếng vĩnh viễn và bị tẩy chay."
            },
            {
                text: "Bán rẻ danh dự và lòng tin của hàng triệu người theo dõi chỉ vì lợi ích tài chính ngắn hạn từ các nhãn hàng là hành động đáng lên án. Kiếm tiền bằng cách lừa dối người khác chỉ chứng tỏ bạn là kẻ thực dụng và thiếu trách nhiệm xã hội.",
                damageToOpponent: 4,
                damageToPlayer: 10,
                rating: "YẾU (Cảm tính & Phòng thủ)",
                summary: "Phản bác bằng công kích vô lương tâm và bán rẻ danh dự."
            }
        ]
    }
];

// Random retorts pools based on response quality
const STRONG_RETORTS = [
    "Hừ, bạn lý luận biện chứng sắc bén đấy. Nhưng đừng đùa với cái tôi triệu view của tôi!",
    "Giá trị thặng dư... lực lượng sản xuất trực tiếp... Nghe đau đầu quá nhưng tôi không cãi lại được!",
    "Lập luận này đanh thép đấy. Cái cột phông bạt của tôi đang lung lay dữ dội rồi...",
    "Lý thuyết của bạn sắc bén thật, tôi bắt đầu cảm thấy cái hào nhoáng bên ngoài này hơi lung lay...",
    "Được lắm, luận điểm rất logic! Nhưng tôi sẽ không đầu hàng dễ dàng thế đâu!"
];

const MEDIUM_RETORTS = [
    "Nghe cũng có lý thuyết đấy, nhưng thế giới thực tế vẫn cần tiền để thanh toán hóa đơn chứ?",
    "Cũng tạm được, nhưng chưa đủ để dập tắt cái danh tiếng triệu follow của tôi đâu nhé!",
    "Lập luận khá thực tế đấy, nhưng tôi vẫn chưa bị thuyết phục hoàn toàn đâu.",
    "Bạn nói cũng đúng phần nào, nhưng tiền bạc vẫn mang lại quyền lực rất lớn trong thực tế.",
    "Lập luận tạm ổn, để xem lượt sau bạn chống đỡ thế nào!"
];

const WEAK_RETORTS = [
    "Haha! Bạn phản biện yếu ớt quá. Lấy tri thức nghèo nàn đó ra đọ với đống đồ hiệu của tôi sao?",
    "Chỉ biết công kích cá nhân thế thôi sao? Đồ hiệu của tôi vẫn phát sáng và bạn vẫn bất lực!",
    "Lập luận quá cảm tính! Bạn chỉ đang ghen tị với sự thành công sớm và giàu có của tôi mà thôi.",
    "Phản biện quá non nớt! Bạn chẳng chỉ ra được bản chất của vấn đề gì cả ngoài sự tức giận.",
    "Quá yếu! Tri thức của bạn chỉ dừng lại ở mức ghen tị trẻ con thế thôi sao?"
];

// Helper to shuffle array
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export default function DialecticalDebate() {
    const navigate = useNavigate();

    // Game states
    const [gameState, setGameState] = useState('start'); // start | play | retort | loading | result
    const [currentTurn, setCurrentTurn] = useState(0);
    const [playerHp, setPlayerHp] = useState(100);
    const [opponentHp, setOpponentHp] = useState(100);
    const [argumentsHistory, setArgumentsHistory] = useState([]);
    
    // Dynamic game pools
    const [activeScenarios, setActiveScenarios] = useState([]);
    const [startBragText, setStartBragText] = useState("");
    const [currentChoices, setCurrentChoices] = useState([]);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [retortText, setRetortText] = useState("");
    
    const [screenShake, setScreenShake] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("Đang liên hệ văn phòng Triết học...");
    const [apiError, setApiError] = useState(false);

    const handleStartGame = () => {
        setPlayerHp(100);
        setOpponentHp(100);
        setArgumentsHistory([]);
        setCurrentTurn(0);
        setSelectedChoice(null);
        
        // Randomize the starting brag statement
        const randomBrag = START_BRAGS[Math.floor(Math.random() * START_BRAGS.length)];
        setStartBragText(randomBrag);
        
        // Shuffle scenarios and select exactly 10 rounds
        const shuffledScenarios = shuffleArray(SCENARIOS_POOL).slice(0, 10);
        setActiveScenarios(shuffledScenarios);
        
        // Prepare choices for the first round
        const choices = shuffleArray(shuffledScenarios[0].choices);
        setCurrentChoices(choices);
        
        setGameState('play');
    };

    const handleSelectChoice = (choice) => {
        setSelectedChoice(choice);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);

        // Add damage fluctuations (random factor between -1 and +2)
        const randomFactorOpp = Math.floor(Math.random() * 4) - 1; // -1 to +2
        const randomFactorPl = Math.floor(Math.random() * 3) - 1; // -1 to +1
        
        const finalDamageOpp = Math.max(2, choice.damageToOpponent + randomFactorOpp);
        const finalDamagePl = Math.max(1, choice.damageToPlayer + randomFactorPl);

        // Deduct HP
        const nextOpponentHp = Math.max(0, opponentHp - finalDamageOpp);
        const nextPlayerHp = Math.max(0, playerHp - finalDamagePl);
        
        setOpponentHp(nextOpponentHp);
        setPlayerHp(nextPlayerHp);
        setArgumentsHistory(prev => [...prev, choice.summary]);

        // Select random retort from pool based on choice strength
        let selectedRetort;
        if (choice.damageToOpponent === 12) {
            selectedRetort = STRONG_RETORTS[Math.floor(Math.random() * STRONG_RETORTS.length)];
        } else if (choice.damageToOpponent === 8) {
            selectedRetort = MEDIUM_RETORTS[Math.floor(Math.random() * MEDIUM_RETORTS.length)];
        } else {
            selectedRetort = WEAK_RETORTS[Math.floor(Math.random() * WEAK_RETORTS.length)];
        }
        setRetortText(selectedRetort);

        setGameState('retort');
    };

    const handleNextTurn = () => {
        setSelectedChoice(null);
        const nextTurnIdx = currentTurn + 1;
        
        if (nextTurnIdx < 10 && playerHp > 0 && opponentHp > 0) {
            setCurrentTurn(nextTurnIdx);
            // Prepare and shuffle choices for the next round
            const nextChoices = shuffleArray(activeScenarios[nextTurnIdx].choices);
            setCurrentChoices(nextChoices);
            setGameState('play');
        } else {
            // Battle ended (10 rounds complete or someone reached 0 HP)
            triggerDebateAnalysis(playerHp, opponentHp, argumentsHistory);
        }
    };

    const triggerDebateAnalysis = async (finalPlayerHp, finalOpponentHp, finalArguments) => {
        setGameState('loading');
        setApiError(false);

        const quotes = [
            "Karl Marx đang thẩm định các luận điểm phản biện...",
            "Friedrich Engels đang so sánh sức mạnh biện chứng...",
            "Đang kiểm tra tính nhất quán lý luận...",
            "Đang chấm điểm độ tin cậy tri thức của học giả..."
        ];

        let quoteIndex = 0;
        setLoadingMessage(quotes[0]);
        const interval = setInterval(() => {
            quoteIndex = (quoteIndex + 1) % quotes.length;
            setLoadingMessage(quotes[quoteIndex]);
        }, 3000);

        try {
            const response = await apiClient.post('/games/debate/analyze', {
                playerHp: finalPlayerHp,
                opponentHp: finalOpponentHp,
                arguments: finalArguments
            });

            const result = response.data?.result;
            setAnalysisResult(result);

            // Cập nhật XP/Streak local cache của user
            const storedUser = localStorage.getItem("user");
            if (storedUser && result.newTotalXp) {
                const userObj = JSON.parse(storedUser);
                userObj.totalXp = result.newTotalXp;
                userObj.streak = (userObj.streak || 0) + 1;
                localStorage.setItem("user", JSON.stringify(userObj));
            }

            setGameState('result');
        } catch (err) {
            console.error("Failed to analyze debate game:", err);
            setApiError(true);
            generateFallbackResult(finalPlayerHp, finalOpponentHp);
        } finally {
            clearInterval(interval);
        }
    };

    const generateFallbackResult = (finalPlayerHp, finalOpponentHp) => {
        const isVictory = finalPlayerHp > finalOpponentHp;
        const margin = isVictory 
            ? Math.round((finalPlayerHp * 100) / (finalPlayerHp + finalOpponentHp + 1))
            : -Math.round((finalOpponentHp * 100) / (finalPlayerHp + finalOpponentHp + 1));

        let title, analysis, suggestion;
        if (isVictory) {
            title = "Học Giả Kiến Thiết Lý Luận (Bậc Thầy Biện Chứng)";
            analysis = "Hoan nghênh đồng chí! Trận chiến biện chứng hôm nay đã bộc lộ rõ ràng sức mạnh vô song của tư duy lý tính khi được vũ trang bằng thế giới quan khoa học. Bằng việc vạch trần ảo tưởng về tiền tệ và sự tha hóa hàng hóa, đồng chí đã làm lung lay và đập tan cái tôi phông bạt rỗng tuếch của KOL kia. Đây chính là minh chứng cho việc ý thức tiến bộ khi được tuyên truyền đúng đắn có thể cải tạo tâm lý xã hội thực dụng.";
            suggestion = "Nghiên cứu sâu tác phẩm 'Hệ tư tưởng Đức' để hiểu rõ hơn về nguồn gốc ý thức xã hội.";
        } else {
            title = "Kẻ Bại Trận Trước Ảo Vọng Vật Chất (Thất bại lập luận)";
            analysis = "Đáng tiếc, đồng chí đã để các luận điểm thực dụng và sự sùng bái hàng hóa áp đảo lý tính của mình. Việc đồng chí sử dụng những phản biện cảm tính, công kích cá nhân chỉ chứng tỏ sự thiếu hụt nghiêm trọng trong lý luận Triết học của bản thân. Khi đồng chí không thể chỉ ra bản chất kinh tế xã hội và sự tha hóa trong lời flex của đối thủ, đồng chí đã mặc nhiên thừa nhận vị thế độc tôn của tiền bạc.";
            suggestion = "Đọc kỹ cuốn 'Chống Dühring' của Friedrich Engels để củng cố phương pháp luận biện chứng.";
        }

        const xpGained = isVictory ? 30 : 10;

        setAnalysisResult({
            winMarginPercentage: margin,
            resultTitle: title,
            analysis: analysis,
            suggestion: suggestion,
            xpGained: xpGained,
            newTotalXp: 150
        });
        setGameState('result');
    };

    return (
        <div className={`min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary relative overflow-x-hidden ${screenShake ? 'animate-[bounce_0.2s_ease-in-out_infinite]' : ''}`}>
            {/* Ambient Background overlays */}
            <div className="noise-overlay fixed inset-0 z-[100] pointer-events-none" />
            <div className="vignette fixed inset-0 z-30 pointer-events-none" />
            <div className="fixed inset-0 bg-surface-dim pointer-events-none z-[-1]" />
            <div className="fixed inset-0 atmospheric-fog z-[1] pointer-events-none" />

            <Sidebar />

            <main className="md:ml-64 min-h-screen bg-surface flex flex-col justify-between">
                <div className="pt-24 px-4 md:px-12 py-12 flex-1 flex flex-col justify-center">

                    <AnimatePresence mode="wait">
                        {/* 1. START STATE */}
                        {gameState === 'start' && (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-xl mx-auto text-center space-y-8 bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative"
                            >
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />

                                <div className="space-y-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-500 text-xs font-bold uppercase tracking-widest rounded-full mb-1">
                                        <Sword className="w-4.5 h-4.5" />
                                        Đấu trường biện chứng v2.0
                                    </span>
                                    <h1 className="font-display text-3xl md:text-4xl font-black text-on-background tracking-tight uppercase">
                                        Flex Tri Thức vs. Flex Vật Chất
                                    </h1>
                                    <p className="text-sm text-on-surface-variant font-medium">
                                        Đập tan cái tôi phông bạt bằng lý tính khoa học
                                    </p>
                                </div>

                                <div className="border-y border-outline-variant/10 py-6 text-sm text-on-surface-variant text-justify leading-relaxed space-y-3">
                                    <p>
                                        Đồng chí sẽ bước vào đấu trường 10 lượt tranh biện khốc liệt với <strong>KOL Dennis Flexer</strong>. Các chủ đề flexing của đối thủ sẽ thay đổi ngẫu nhiên mỗi lần chơi (từ sùng bái hàng hiệu, coin rác, từ thiện làm màu đến gia thế khủng).
                                    </p>
                                    <p>
                                        Nhiệm vụ của đồng chí là lựa chọn các phản biện đanh thép nhất để đánh tụt máu **Clout (HP KOL)** xuống 0 trước khi cột **Lý Tính (HP Học Giả)** của mình bị cạn kiệt. Hãy chiến đấu vì danh dự tri thức!
                                    </p>
                                </div>

                                <button
                                    onClick={handleStartGame}
                                    className="w-full px-8 py-3.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-bold uppercase tracking-widest shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                                >
                                    Tuyên chiến Phông bạt
                                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                                </button>
                            </motion.div>
                        )}

                        {/* 2. PLAY & RETORT STATE */}
                        {(gameState === 'play' || gameState === 'retort') && activeScenarios.length > 0 && (
                            <motion.div
                                key="play"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                {/* HP Bars Dashboard */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/20 rounded-2xl p-6 shadow-md relative">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    {/* Player HP */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                                                <Brain className="w-4.5 h-4.5" />
                                                Học Giả (Lý Tính)
                                            </span>
                                            <span className="text-sm font-black text-emerald-500">{playerHp}/100</span>
                                        </div>
                                        <div className="h-3 w-full bg-emerald-950/40 rounded-full overflow-hidden border border-emerald-500/20">
                                            <div 
                                                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                                                style={{ width: `${playerHp}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Opponent HP */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-pink-500 flex items-center gap-1.5">
                                                <Flame className="w-4.5 h-4.5" />
                                                Dennis Flexer (Clout)
                                            </span>
                                            <span className="text-sm font-black text-pink-500">{opponentHp}/100</span>
                                        </div>
                                        <div className="h-3 w-full bg-pink-950/40 rounded-full overflow-hidden border border-pink-500/20">
                                            <div 
                                                className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-500"
                                                style={{ width: `${opponentHp}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Debate Arena Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* Opponent Brag Section */}
                                    <div className="lg:col-span-5 bg-surface-container-low/50 border border-outline-variant/15 rounded-2xl p-6 relative shadow-lg">
                                        <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full border-2 border-pink-500 overflow-hidden bg-pink-500/10">
                                                <img 
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-oK0dsp_C3vIjE4vXMXguDKTcYSJV_GbLTg1U8QdDvz0BE_MMpaa-IRRRpZQj-cMH4shRhuPcvsiGKI_D1MPkHDpcffkI0yix7TWuk5iLRSHX0WcTx0EB60i9zGNDWQKSecrxLOlkjFTAg6wt-xEUUnMbxKeLUhti-qJ6fNYL79V29FsTcWGuTEenzTrwLTZON1_8bC4KaG-0Son1-gGnKRMAVVt4drFWfozCx82870IJgk2NEnFzJBWOwpQYcK6VOriIiBmgAJw" 
                                                    alt="KOL" 
                                                    className="w-full h-full object-cover filter saturate-150"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-on-surface">Dennis Flexer</h4>
                                                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">KOL Phông Bạt Triệu View</span>
                                            </div>
                                        </div>

                                        <div className="relative bg-surface-container-high/60 border border-outline-variant/10 rounded-2xl p-4 text-sm text-on-surface-variant leading-relaxed before:content-[''] before:absolute before:left-5 before:-top-3 before:border-[6px] before:border-transparent before:border-b-surface-container-high">
                                            <AnimatePresence mode="wait">
                                                {gameState === 'play' ? (
                                                    <motion.div 
                                                        key={currentTurn}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="space-y-2 text-justify"
                                                    >
                                                        {currentTurn === 0 && (
                                                            <p className="text-[11px] uppercase tracking-widest text-pink-400 font-bold mb-2">
                                                                Dennis nổ súng bằng lời Flex khởi đầu:
                                                            </p>
                                                        )}
                                                        <p className="italic">
                                                            "{currentTurn === 0 ? startBragText : activeScenarios[currentTurn].opponentText}"
                                                        </p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="retort"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="space-y-3 text-justify"
                                                    >
                                                        <p className="italic font-semibold text-pink-400">
                                                            "{retortText}"
                                                        </p>
                                                        <div className="text-[11px] border-t border-outline-variant/10 pt-2 flex flex-col gap-1">
                                                            <span className="text-emerald-500 font-bold">✓ Phản đòn: {selectedChoice.rating}</span>
                                                            <span className="text-outline">Sát thương lên KOL: Trực tiếp & Biến động</span>
                                                            <span className="text-red-400">Sát thương lên Học giả: Nhẹ</span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Player Action Section */}
                                    <div className="lg:col-span-7 bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-6 relative shadow-lg">
                                        <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                        
                                        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3 mb-4">
                                            <span className="text-xs uppercase tracking-widest text-secondary font-bold">
                                                Lượt biện luận {currentTurn + 1} / 10
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-secondary/15 text-secondary text-[10px] font-bold rounded-full">
                                                Lập luận Biện chứng
                                            </span>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {gameState === 'play' ? (
                                                <motion.div 
                                                    key="options"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <p className="text-xs text-outline mb-3 font-semibold">Chọn phương án phản biện sắc bén nhất:</p>
                                                    {currentChoices.map((choice, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleSelectChoice(choice)}
                                                            className="w-full text-left p-4.5 bg-surface-container-high/40 border border-outline-variant/10 hover:border-secondary hover:bg-secondary/5 rounded-xl text-sm font-medium text-on-surface hover:text-secondary leading-relaxed transition-all duration-300 active:scale-[0.99] cursor-pointer flex gap-4"
                                                        >
                                                            <span className="w-5.5 h-5.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                                {String.fromCharCode(65 + idx)}
                                                            </span>
                                                            <span>{choice.text}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="next"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="py-12 text-center space-y-6"
                                                >
                                                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary animate-pulse">
                                                        <Sword className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-on-surface">Lượt biện luận đã ghi nhận!</h4>
                                                        <p className="text-xs text-outline mt-1">
                                                            Nhấn nút bên dưới để chuyển sang lượt đối đầu tiếp theo.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleNextTurn}
                                                        className="px-8 py-3 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all cursor-pointer shadow-md"
                                                    >
                                                        Tiếp tục
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. LOADING STATE */}
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
                                    <Sword className="w-8 h-8 text-secondary absolute inset-0 m-auto animate-pulse" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-display text-xl font-bold text-on-background">Đang kết nối văn phòng Triết học</h3>
                                    <p className="text-xs text-outline uppercase tracking-wider font-semibold">
                                        Karl Marx đang thẩm định các luận điểm phản biện...
                                    </p>
                                </div>

                                <div className="bg-surface-container-high/30 rounded-xl p-5 border border-outline-variant/10 min-h-[100px] flex items-center justify-center">
                                    <p className="text-xs text-on-surface-variant italic leading-relaxed text-center font-medium max-w-sm">
                                        "{loadingMessage}"
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
                                {/* Scorecard */}
                                <div className="bg-surface-container-low/75 border border-outline-variant/20 rounded-2xl p-8 text-center relative backdrop-blur-md shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${analysisResult.winMarginPercentage >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {analysisResult.winMarginPercentage >= 0 ? <Trophy className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                                    </div>
                                    
                                    <span className="text-[10px] text-outline uppercase tracking-widest font-bold block mb-1">Kết quả đối đầu:</span>
                                    <h2 className="font-display text-3xl font-black text-on-surface tracking-tight uppercase leading-tight bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                                        {analysisResult.winMarginPercentage >= 0 ? "Chiến Thắng Biện Chứng" : "Thất Bại Lập Luận"}
                                    </h2>
                                    <p className="text-sm text-outline mt-2 max-w-md mx-auto">
                                        Danh hiệu: <span className="font-bold text-on-surface">{analysisResult.resultTitle}</span>
                                    </p>
                                    
                                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6 border-t border-outline-variant/10 pt-6">
                                        <div>
                                            <span className="block text-2xl font-bold text-emerald-500">{playerHp}/100</span>
                                            <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">Lý tính Học giả</span>
                                        </div>
                                        <div>
                                            <span className="block text-2xl font-bold text-pink-500">{opponentHp}/100</span>
                                            <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">Clout của KOL</span>
                                        </div>
                                        <div>
                                            <span className={`block text-2xl font-bold ${analysisResult.winMarginPercentage >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {analysisResult.winMarginPercentage >= 0 ? '+' : ''}{analysisResult.winMarginPercentage}%
                                            </span>
                                            <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">Thế áp đảo</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 font-bold text-xs">
                                        <Trophy className="w-4 h-4 animate-bounce" />
                                        Nhận được +{analysisResult.xpGained} XP thưởng học giả
                                    </div>
                                </div>

                                {/* AI review report */}
                                <div className="bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl space-y-6 relative">
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                                    
                                    <div className="border-b border-outline-variant/10 pb-4">
                                        <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                                            <Award className="w-5 h-5 text-secondary" />
                                            Nhận xét biện chứng từ Karl Marx
                                        </h3>
                                    </div>

                                    <div className="text-sm text-on-surface-variant leading-relaxed text-justify space-y-4">
                                        {analysisResult.analysis.split('\n\n').map((para, i) => (
                                            <p key={i} className="first-letter:text-3xl first-letter:font-black first-letter:text-secondary first-letter:mr-2 first-letter:float-left text-justify">
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
                                            <h4 className="text-xs uppercase tracking-widest text-outline font-bold">Tài liệu học tập khuyên đọc:</h4>
                                            <p className="text-sm font-semibold text-on-surface leading-snug">
                                                {analysisResult.suggestion}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Replay & navigation buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                    <button
                                        onClick={handleStartGame}
                                        className="flex-1 px-6 py-3.5 bg-surface-container-high border border-outline-variant/20 hover:border-secondary hover:bg-secondary/5 rounded-xl font-bold text-xs uppercase tracking-wider text-secondary transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98"
                                    >
                                        <RefreshCw className="w-4.5 h-4.5" />
                                        Tái đấu
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
                    </AnimatePresence>

                </div>
                <Footer />
            </main>
        </div>
    );
}
