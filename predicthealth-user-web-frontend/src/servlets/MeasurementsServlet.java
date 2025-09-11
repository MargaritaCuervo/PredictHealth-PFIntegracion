package servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import javax.servlet.ServletException;
import java.io.IOException;
import java.sql.*;

@WebServlet("/api/measurements")
public class MeasurementsServlet extends HttpServlet {
    private String dbUrl = "jdbc:postgresql://localhost:5432/predicthealth";
    private String dbUser = "ph_user";
    private String dbPassword = "ph_password";

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String sysStr = req.getParameter("bp_systolic");
        String diaStr = req.getParameter("bp_diastolic");
        String gluStr = req.getParameter("glucose");
        Integer userId = (Integer) req.getSession().getAttribute("userId");

        if (userId == null) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String sql = "INSERT INTO measurements (user_id, systolic, diastolic, glucose, measured_at) VALUES (?, ?, ?, ?, now())";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, userId);
                ps.setInt(2, Integer.parseInt(sysStr));
                ps.setInt(3, Integer.parseInt(diaStr));
                ps.setDouble(4, Double.parseDouble(gluStr));
                ps.executeUpdate();
            }
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.getWriter().write("{\"status\":\"ok\"}");
        } catch (SQLException ex) {
            throw new ServletException(ex);
        }
    }
}
