import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Alert, Badge } from "react-bootstrap";
import Header from "../../components/HeaderAdmin";
import Footer from "../../components/Footer";

function AdminReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/reservation");
        const data = res.data;

        if (Array.isArray(data)) {
          setReservations(data); // fallback in case only array returned
        } else if (Array.isArray(data.reservations)) {
          setReservations(data.reservations); // correct based on backend response
        } else {
          throw new Error("Invalid response format");
        }

        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách đặt bàn.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return (
    <>
      <Header />
      <Container className="mt-4">
        <h3 className="mb-4 text-center">Quản lý Đặt bàn</h3>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && reservations.length === 0 && (
          <Alert variant="info">Không có đặt bàn nào.</Alert>
        )}

        {!loading && reservations.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Tên</th>
                <th>SĐT</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Số khách</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((rsv) => (
                <tr key={rsv._id}>
                  <td>{rsv.name}</td>
                  <td>{rsv.phone}</td>
                  <td>{new Date(rsv.reservationDate).toLocaleDateString()}</td>
                  <td>{rsv.reservationTime}</td>
                  <td>{rsv.guestCount}</td>
                  <td>{rsv.specialRequest || "-"}</td>
                  <td>
                    <Badge
                      bg={
                        rsv.status === "confirmed"
                          ? "success"
                          : rsv.status === "cancelled"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {rsv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
      <Footer />
    </>
  );
}

export default AdminReservationPage;
