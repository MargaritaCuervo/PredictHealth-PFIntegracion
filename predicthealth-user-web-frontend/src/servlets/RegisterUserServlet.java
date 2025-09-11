package servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;
import java.util.Optional;

@WebServlet(name="RegisterUserServlet", urlPatterns={"/auth/register"})
public class RegisterUserServlet extends HttpServlet {

    private String dbUrl = "jdbc:postgresql://localhost:5432/predicthealth";
    private String dbUser = "ph_user";
    private String dbPassword = "ph_password";

    @Override
    public void init() throws ServletException {
        super.init();
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new ServletException("Postgres JDBC Driver not found", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        String firstName = Optional.ofNullable(req.getParameter("firstName")).orElse("");
        String lastName = Optional.ofNullable(req.getParameter("lastName")).orElse("");
        String ageStr = req.getParameter("age");
        String gender = req.getParameter("gender");
        String weightStr = req.getParameter("weight");
        String heightStr = req.getParameter("height");
        String medicalHistory = req.getParameter("medicalHistory");

        // Validación backend básica
        int age = 0;
        double weight = 0, height = 0;
        try {
            age = Integer.parseInt(ageStr);
            weight = Double.parseDouble(weightStr);
            height = Double.parseDouble(heightStr);
        } catch (Exception e) {
            req.setAttribute("error", "Datos numéricos inválidos.");
            req.getRequestDispatcher("/register_user.html").forward(req, resp);
            return;
        }

        // Insertar en base de datos
        String insertSql = "INSERT INTO users (first_name, last_name, age, gender, weight, height, medical_history, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, now())";

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(insertSql)) {

            ps.setString(1, firstName);
            ps.setString(2, lastName);
            ps.setInt(3, age);
            ps.setString(4, gender);
            ps.setDouble(5, weight);
            ps.setDouble(6, height);
            ps.setString(7, medicalHistory);

            ps.executeUpdate();

            // Redirigir al dashboard o a registro de hábitos
            resp.sendRedirect(req.getContextPath() + "/lifestyle.html");

        } catch (SQLException ex) {
            ex.printStackTrace();
            req.setAttribute("error", "Error al guardar usuario: " + ex.getMessage());
            req.getRequestDispatcher("/register_user.html").forward(req, resp);
        }
    }
}
