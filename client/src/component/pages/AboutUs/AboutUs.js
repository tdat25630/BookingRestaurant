import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import Header from '../../Header/Header';
import './AboutUs.css';
import { FaTwitter, FaFacebookF, FaVimeoV, FaInstagram } from 'react-icons/fa';

const heroBgImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070';
const storyImg1 = 'https://i.ytimg.com/vi/w34Qnc-9KBU/hqdefault.jpg';
const storyImg2 = 'https://ninhbinhfood.com/wp-content/uploads/2023/02/cach-lam-ruou-duc.jpg';
const storyImg3 = 'https://huongvietmart.vn/wp-content/uploads/2022/09/che-dac-san-mien-nam-1.jpg';
const chefImage = 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&q=80&w=1974';

function AboutUs() {
    const [specialties, setSpecialties] = useState([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(true);
    const [specialtiesError, setSpecialtiesError] = useState(null);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                setLoadingSpecialties(true);
                const response = await axios.get('http://localhost:8080/api/order-items/bestsellers?limit=3');
                if (response.data.success) {
                    setSpecialties(response.data.data);
                } else {
                    setSpecialtiesError('Không thể tải danh sách món ăn.');
                }
            } catch (error) {
                console.error('Lỗi khi tải món ăn đặc trưng:', error);
                setSpecialtiesError('Lỗi kết nối đến server.');
            } finally {
                setLoadingSpecialties(false);
            }
        };
        fetchSpecialties();
    }, []);

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <>
            <Header />
            <div className="savory-about-us">
                <section className="hero-section" style={{ backgroundImage: `url(${heroBgImage})` }}>
                    <div className="hero-content">
                        <h1>Về ...</h1>
                        <a href="#our-story" className="scroll-down">Khám Phá Thêm</a>
                    </div>
                </section>

                <section id="our-story" className="content-section">
                    <div className="section-header">
                        <p className="pre-title">HƯƠNG VỊ TRUYỀN THỐNG</p>
                        <h2>Hành Trình Ẩm Thực Việt</h2>
                    </div>
                    <p className="section-description">
                        Nhà hàng được thành lập với mong muốn lưu giữ và lan tỏa tinh hoa ẩm thực Việt Nam.
                        Từ những món ăn quê nhà giản dị đến những món đặc sản vùng miền, mỗi món tại nhà hàng đều được chăm chút bằng cả tấm lòng và tâm huyết.
                        Không gian ấm cúng như chính ngôi nhà thân thương, nơi mọi thế hệ cùng quây quần bên mâm cơm đậm đà bản sắc Việt.
                    </p>
                        <div className="story-grid">
                            <div className="story-item">
                                <img src={storyImg1} alt="Gỏi cuốn" />
                                <h3>Khai Vị Gỏi Cuốn Tươi Ngon</h3>
                                <p>Gỏi cuốn truyền thống với tôm, thịt, rau sống và nước mắm chua ngọt – món khai vị thanh mát, nhẹ nhàng mở đầu bữa ăn đậm chất Việt.</p>
                                <a href="#" className="read-more">XEM THÊM</a>
                            </div>
                            <div className="story-item">
                                <img src={storyImg2} alt="Rượu nếp" />
                                <h3>Rượu Nếp & Món Chính Truyền Thống</h3>
                                <p>Rượu nếp quê hương hòa quyện cùng các món chính như cá kho tộ, thịt đông hay bún bò Huế mang lại trải nghiệm trọn vẹn và khó quên.</p>
                                <a href="#" className="read-more">XEM THÊM</a>
                            </div>
                            <div className="story-item">
                                <img src={storyImg3} alt="Chè tráng miệng" />
                                <h3>Chè Ngọt Khép Lại Bữa Cơm</h3>
                                <p>Những món chè truyền thống như chè đậu đỏ, chè chuối nếp nướng là cái kết ngọt ngào, tròn vị cho một bữa ăn Việt đầy yêu thương.</p>
                                <a href="#" className="read-more">XEM THÊM</a>
                            </div>
                        </div>
                </section>

                <section className="content-section chef-section">
                    <div className="chef-content">
                        <div className="section-header">
                            <p className="pre-title">NGHỆ SĨ CỦA HƯƠNG VỊ</p>
                            <h2>Bếp Trưởng Của Chúng Tôi</h2>
                        </div>
                        <p className="section-description">
                            Với niềm đam mê mãnh liệt và đôi tay tài hoa, Bếp trưởng của chúng tôi là người nghệ sĩ đứng sau mỗi kiệt tác ẩm thực.
                            Mỗi món ăn không chỉ là sự kết hợp của nguyên liệu, mà còn là tâm huyết và câu chuyện mà ông muốn kể cho thực khách.
                        </p>
                        <button className="menu-button">KHÁM PHÁ THỰC ĐƠN</button>
                    </div>
                    <div className="chef-image">
                        <img src={chefImage} alt="Bếp trưởng nhà hàng" />
                    </div>
                </section>

                <section className="content-section specialties-section">
                    <div className="section-header">
                        <p className="pre-title">TINH HOA ẨM THỰC</p>
                        <h2>Món Ăn Đặc Trưng</h2>
                    </div>
                    <div className="specialties-nav">
                        <a href="#" >KHAI VỊ</a>
                        <a href="#" className="active">MÓN CHÍNH</a>
                        <a href="#">TRÁNG MIỆNG</a>
                    </div>

                    <div className="specialties-grid">
                        {loadingSpecialties ? (
                            <div className="text-center w-100"><Spinner animation="border" /></div>
                        ) : specialtiesError ? (
                            <p className="text-center text-danger w-100">{specialtiesError}</p>
                        ) : (
                            specialties.map(dish => (
                                <div className="specialty-item" key={dish.id}>
                                    <img src={dish.image} alt={dish.name} />
                                    <p>{dish.name} - {formatCurrency(dish.price)}</p>
                                </div>
                            ))
                        )}
                    </div>


                </section>

                {/* <footer className="footer-section">
                    <div className="footer-grid">
                        <div className="footer-widget">
                            <h4>TIN TỨC MỚI NHẤT</h4>
                            <p>Cảm ơn quý khách đã ghé thăm! Hãy theo dõi chúng tôi trên mạng xã hội để cập nhật những sự kiện và ưu đãi đặc biệt sắp tới.</p>
                        </div>
                        <div className="footer-widget">
                            <h4>SAVORY RESTAURANT</h4>
                            <p>Nơi hội tụ của hương vị, nghệ thuật và những khoảnh khắc đáng nhớ. Chúng tôi hân hạnh được phục vụ quý khách.</p>
                            <p>info@savory.com.vn</p>
                            <p>(+84) 24 3333 7890</p>
                            <div className="social-icons">
                                <a href="#"><FaTwitter /></a>
                                <a href="#"><FaFacebookF /></a>
                                <a href="#"><FaVimeoV /></a>
                                <a href="#"><FaInstagram /></a>
                            </div>
                        </div>
                        <div className="footer-widget">
                            <h4>HÌNH ẢNH NỔI BẬT</h4>
                            <div className="instagram-grid">
                                <img src={storyImg1} alt="Instagram 1" />
                                <img src={storyImg2} alt="Instagram 2" />
                                <img src={storyImg3} alt="Instagram 3" />
                                <img src={chefImage} alt="Instagram 4" />
                                <img src={specialties[0]?.image || storyImg1} alt="Instagram 5" />
                                <img src={specialties[1]?.image || storyImg2} alt="Instagram 6" />

                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; Bản quyền thuộc về Kalson Themes</p>
                    </div>
                </footer> */}
            </div>
        </>
    );
}

export default AboutUs;