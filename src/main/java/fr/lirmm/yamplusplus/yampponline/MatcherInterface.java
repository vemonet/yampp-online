package fr.lirmm.yamplusplus.yampponline;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static fr.lirmm.yamplusplus.yampponline.Matcher.processRequest;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.simple.JSONObject;

public class MatcherInterface extends HttpServlet {

  private static final long serialVersionUID = 1L;

  public static JSONObject liste = null;
  public static java.util.Map<String, String> Onto1 = new HashMap<>();
  public static java.util.Map<String, String> Onto2 = new HashMap<>();

  /**
   * Called when running Matcher with the UI. Servlet's doPost which run YAM++
   * and redirect to the .JSP
   *
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {

    Logger.getLogger(MatcherInterface.class.getName()).log(Level.INFO, "Start of doPost of MatcherInterface...");
    
    response.setCharacterEncoding("UTF-8");

    // Retrieve ontologies String
    YamFileHandler fileHandler = null;
    try {
      fileHandler = new YamFileHandler();
    } catch (ClassNotFoundException ex) {
      Logger.getLogger(MatcherInterface.class.getName()).log(Level.SEVERE, null, ex);
    }

    // get time at the matching beginning
    long begin = System.currentTimeMillis();

    // Process request (upload files and run YAM)
    String matcherResult = null;
    try {
      // Processing the request (running YamppOntologyMatcher)
      Logger.getLogger(MatcherInterface.class.getName()).log(Level.INFO, "Run processRequest...");
      request = processRequest(request);
      if (request.getAttribute("errorMessage") == null) {
        matcherResult = (String) request.getAttribute("matcherResult");
      }
    } catch (ClassNotFoundException e) {
      request.setAttribute("errorMessage", "YAM matcher execution failed: " + e.getMessage());
      System.out.println("YAM matcher execution failed: " + e.getMessage());
    }
    if (request.getAttribute("errorMessage") != null) {
      // send response
      this.getServletContext().getRequestDispatcher("/WEB-INF/validation.jsp").forward(request, response);
    }

    // get time at the matching end
    long end = System.currentTimeMillis();

    // matching time equals to
    float execTime = ((float) (end - begin)) / 1000f;
    // String conversion to allow data transfer to result.jsp
    String s = Float.toString(execTime);
    // add matching time to response
    request.setAttribute("time", s);

    // Call validation.jsp to display results in /result URL path and send the request with sourceOnt, targetOnt and alignment results
    this.getServletContext().getRequestDispatcher("/WEB-INF/validation.jsp").forward(request, response);
  }

  /**
   * Round a double to 2 decimal places
   *
   * @param value
   * @return double
   */
  public static double round(double value) {
    long factor = (long) Math.pow(10, 2);
    value = value * factor;
    long tmp = Math.round(value);
    return (double) tmp / factor;
  }
}
