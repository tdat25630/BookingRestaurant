import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button as BootstrapButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUtensils,
  faUser,
  faStar,
  faMapMarkerAlt,
  faClock,
  faPhone,
  faBookmark,
  faHeart,
  faArrowRight,
  faQuoteLeft,
  faCrown,
  faFire,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import Header from '../../Header/Header';
import Button from '../../Button/Button';

const Home = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [dishesError, setDishesError] = useState(null);

  const isChef = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role === "chef";
  };

  useEffect(() => {
    if (isChef) {
      navigate('/chef');
    }
    const getUserInfo = () => {
      try {
        // Lấy từ localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setCurrentUser({
            name: userData.username,
            avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          });
        } else {
          // Nếu không có thông tin user, có thể redirect về login
          // navigate('/login');
          setCurrentUser({
            name: 'Khách',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          });
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        setCurrentUser({
          name: 'Khách',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        });
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        setLoadingDishes(true);
        setDishesError(null);

        // Call API để lấy top 3 bestsellers
        const response = await axios.get('http://localhost:8080/api/order-items/bestsellers?limit=3');

        if (response.data.success) {
          setFeaturedDishes(response.data.data);
        } else {
          // Fallback nếu API không trả về data
          setDishesError('Không thể tải dữ liệu món ăn');
        }
      } catch (error) {
        console.error('Error fetching featured dishes:', error);
        setDishesError('Lỗi khi tải món ăn nổi bật');

        // Fallback với default data nếu API lỗi
        setFeaturedDishes([
          {
            id: 'fallback-1',
            name: 'Pizza Margherita Deluxe',
            category: 'Italian',
            rating: 4.9,
            reviews: 156,
            price: 299000,
            image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
            restaurant: 'Golden Plate Restaurant',
            description: 'Pizza cổ điển với cà chua tươi, mozzarella và basil',
            cookingTime: '15-20 phút',
            ingredients: ['Cà chua', 'Mozzarella', 'Basil'],
            isBestSeller: true,
            isPopular: true
          },
          {
            id: 'fallback-2',
            name: 'Phở Bò Đặc Biệt',
            category: 'Vietnamese',
            rating: 4.8,
            reviews: 203,
            price: 85000,
            image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop',
            restaurant: 'Spice Garden',
            description: 'Phở bò truyền thống với nước dùng được niêu trong 12 tiếng',
            cookingTime: '10-15 phút',
            ingredients: ['Thịt bò', 'Bánh phở', 'Hành lá'],
            isBestSeller: true,
            isPopular: true
          },
          {
            id: 'fallback-3',
            name: 'Tôm Hùm Nướng Bơ Tỏi',
            category: 'Seafood',
            rating: 4.7,
            reviews: 98,
            price: 650000,
            image: 'https://images.unsplash.com/photo-1559847844-d312173bb2ca?w=400&h=300&fit=crop',
            restaurant: 'Ocean View Seafood',
            description: 'Tôm hùm tươi nướng với bơ tỏi thơm phức',
            cookingTime: '20-25 phút',
            ingredients: ['Tôm hùm', 'Bơ tỏi', 'Rau thơm'],
            isBestSeller: true,
            isPopular: true
          }
        ]);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchFeaturedDishes();
  }, []);




  const [upcomingBookings, setUpcomingBookings] = useState([
    {
      id: 101,
      restaurant: 'Golden Plate Restaurant',
      date: '2025-07-15',
      time: '19:00',
      guests: 2,
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop'
    },
    {
      id: 102,
      restaurant: 'Sakura Japanese',
      date: '2025-07-20',
      time: '20:00',
      guests: 4,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=100&h=100&fit=crop'
    }
  ]);

  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Trần Thị Mai',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'Pizza Margherita ở đây tuyệt vời! Vỏ bánh giòn, phô mai tan chảy hoàn hảo.',
      dish: 'Pizza Margherita Deluxe'
    },
    {
      id: 2,
      name: 'Lê Văn Hùng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'Tôm hùm nướng bơ tỏi thật sự đáng tiền. Tôm tươi ngọt, gia vị đậm đà.',
      dish: 'Tôm Hùm Nướng Bơ Tỏi'
    },
    {
      id: 3,
      name: 'Phạm Thị Lan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'Phở bò đặc biệt nước dùng trong vắt, thịt bò mềm. Nhớ mãi!',
      dish: 'Phở Bò Đặc Biệt'
    }
  ]);

  const handleBooking = () => {
    navigate('/booking');
  };

  const handleViewDish = (id) => {
    navigate(`/dish/${id}`);
  };

  const handleOrderDish = (dish) => {
    // Logic thêm món vào giỏ hàng
    console.log('Đặt món:', dish.name);
    // navigate('/cart');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Chào mừng <span className="highlight">{currentUser.name}</span>! 👋
                </h1>
                <p className="hero-subtitle">
                  Khám phá và đặt bàn tại những nhà hàng tốt nhất trong khu vực của bạn
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Món ăn</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">10K+</span>
                    <span className="stat-label">Khách hàng</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Đơn hàng</span>
                  </div>
                </div>
                <div className="hero-actions">
                  <Button onClick={handleBooking} className="primary-btn">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Đặt Bàn Ngay
                  </Button>
                  {/* <BootstrapButton variant="outline-light" size="lg" className="secondary-btn">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Khám Phá Menu
                  </BootstrapButton> */}
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
                  alt="Restaurant"
                  className="img-fluid"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Booking Section */}
      {/* {upcomingBookings.length > 0 && (
        <section className="quick-booking-section">
          <Container>
            <Row>
              <Col>
                <div className="section-header">
                  <h2>
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-3" />
                    Đặt Bàn Sắp Tới
                  </h2>
                </div>
                <Row>
                  {upcomingBookings.map(booking => (
                    <Col md={6} key={booking.id} className="mb-4">
                      <Card className="booking-card">
                        <Card.Body>
                          <div className="booking-info">
                            <div className="booking-image">
                              <img src={booking.image} alt={booking.restaurant} />
                            </div>
                            <div className="booking-details">
                              <h5>{booking.restaurant}</h5>
                              <p className="booking-date">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                {formatDate(booking.date)}
                              </p>
                              <p className="booking-time">
                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                {booking.time} • {booking.guests} người
                              </p>
                              <Badge
                                bg={booking.status === 'confirmed' ? 'success' : 'warning'}
                                className="status-badge"
                              >
                                {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                              </Badge>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Container>
        </section>
      )} */}

      {/* Featured Dishes Section */}
      <section className="featured-dishes">
        <Container>
          <div className="section-header">
            <h2>
              <FontAwesomeIcon icon={faCrown} className="me-3" />
              Món Ăn Nổi Bật
            </h2>
            <p>Những món ăn được yêu thích và đặt nhiều nhất</p>
          </div>
          <Row>
            {featuredDishes.map(dish => (
              <Col lg={4} md={6} key={dish.id} className="mb-4">
                <Card className="dish-card">
                  <div className="card-image-wrapper">
                    <img
                      src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                      alt={dish.name}
                      className="card-img-top"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="image-overlay">
                      <div className="overlay-badges">
                        {dish.isPopular && (
                          <Badge bg="danger" className="popular-badge">
                            🔥 Phổ biến
                          </Badge>
                        )}
                        {dish.isBestSeller && (
                          <Badge bg="warning" className="bestseller-badge">
                            👑 Best Seller
                          </Badge>
                        )}
                        {dish.totalQuantity && (
                          <Badge bg="info" className="quantity-badge">
                            Đã bán: {dish.totalQuantity}
                          </Badge>
                        )}
                      </div>
                      <div className="overlay-actions">
                        <BootstrapButton
                          variant="light"
                          size="sm"
                          className="action-btn"
                          title="Yêu thích"
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </BootstrapButton>
                        <BootstrapButton
                          variant="light"
                          size="sm"
                          className="action-btn"
                          title="Lưu món"
                        >
                          <FontAwesomeIcon icon={faBookmark} />
                        </BootstrapButton>
                      </div>
                    </div>
                  </div>
                  <Card.Body>
                    <div className="dish-header">
                      <h5 className="dish-name">{dish.name}</h5>
                      {/* <span className="dish-category">{dish.category}</span> */}
                    </div>
                    <p className="dish-restaurant">
                      <FontAwesomeIcon icon={faUtensils} className="me-2" />
                      {dish.restaurant || 'Nhà hàng'}
                    </p>
                    <p className="dish-description">{dish.description}</p>



                    <div className="dish-info">
                      <p className="cooking-time">
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        {dish.cookingTime || '15-20 phút'}
                      </p>
                    </div>

                    {dish.ingredients && dish.ingredients.length > 0 && (
                      <div className="ingredients-tags">
                        {dish.ingredients.slice(0, 3).map((ingredient, index) => (
                          <Badge key={index} bg="light" text="dark" className="ingredient-badge">
                            {ingredient}
                          </Badge>
                        ))}
                        {dish.ingredients.length > 3 && (
                          <Badge bg="secondary" className="ingredient-badge">
                            +{dish.ingredients.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="price-section">
                      <div className="price-info">
                        <span className="current-price">{formatCurrency(dish.price)}</span>

                      </div>
                    </div>

                    <div className="card-actions">
                      <BootstrapButton
                        variant="outline-primary"
                        onClick={() => handleViewDish(dish.id)}
                        className="view-btn"
                      >
                        Xem Chi Tiết
                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                      </BootstrapButton>
                      <Button
                        onClick={() => handleOrderDish(dish)}
                        className="order-btn"
                      >
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        Đặt Món
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {/* <div className="text-center mt-4">
            <BootstrapButton variant="outline-primary" size="lg">
              Xem Tất Cả Món Ăn
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </BootstrapButton>
          </div> */}
        </Container>
      </section>

      {/* Testimonials Section */}


      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2>Sẵn sàng để có trải nghiệm ẩm thực tuyệt vời?</h2>
              <p>Đặt bàn ngay hôm nay và thưởng thức những món ăn ngon nhất</p>
              <div className="cta-actions">
                <Button onClick={handleBooking} className="cta-btn">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Đặt Bàn Ngay
                </Button>
                <BootstrapButton variant="outline-light" size="lg">
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  Liên Hệ Hỗ Trợ
                </BootstrapButton>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
