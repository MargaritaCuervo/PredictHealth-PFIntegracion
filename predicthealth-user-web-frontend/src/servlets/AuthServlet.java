package servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import javax.servlet.ServletException;
import java.io.IOException;
import java.sql.*;

@WebServlet("/auth/login")
public class AuthServlet extends HttpServlet {
    private String dbUrl = "jdbc:postgresql://localhost:5432/predicthealth";
    private String dbUser = "ph_user";
    private String dbPassword = "ph_password";

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password"); // en producción: hash+sal

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String sql = "SELECT id, first_name FROM users WHERE username = ? AND password_hash = ?"; // ejemplo
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, username);
                ps.setString(2, password); // REEMPLAZAR: comparar hash
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        HttpSession session = req.getSession(true);
                        session.setAttribute("userId", rs.getInt("id"));
                        session.setAttribute("userName", rs.getString("first_name"));
                        resp.sendRedirect(req.getContextPath() + "/user_dashboard.html");
                        return;
                    } else {
                        req.setAttribute("error","Credenciales inválidas");
                        req.getRequestDispatcher("/log_in.html").forward(req, resp);
                    }
                }
            }
        } catch (SQLException ex) {
            throw new ServletException(ex);
        }
    }
}
