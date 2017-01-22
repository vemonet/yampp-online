package fr.lirmm.yamplusplus.yampponline;

import com.hp.hpl.jena.rdf.model.Model;
import fr.lirmm.yamplusplus.yamppls.YamppUtils;
import static fr.lirmm.yamplusplus.yampponline.MatcherInterface.liste;
import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import javax.servlet.ServletException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

//@Path("/matcher")
public class Validator extends HttpServlet {

  private static final long serialVersionUID = 1L;

  /**
   * Redirect to validator.jsp to ask user to provide alignment and ontologies
   * files
   *
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  public void doGet(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    this.getServletContext().getRequestDispatcher("/WEB-INF/validator.jsp").forward(request, response);
  }

  /**
   * Process Post request (from /validator form submission) and redirect to
   * result.jsp
   *
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    //Logger myLog = Logger.getLogger(Validator.class.getName());

    // Retrieve ontologies String from file or URL
    YamFileHandler fileHandler = null;
    try {
      fileHandler = new YamFileHandler();
    } catch (ClassNotFoundException ex) {
      Logger.getLogger(Validator.class.getName()).log(Level.ERROR, null, ex);
    }

    // Get string of alignment from file
    String stringAlignmentFile = fileHandler.readFileFromRequest("rdfAlignmentFile", request);

    // Parse the alignment file to put its data in an Array of Map
    liste = fileHandler.parseOaeiAlignmentFormat(stringAlignmentFile);
    // add cell data list to response
    // TODO: Change liste variable name?
    request.setAttribute("alignment", liste);

    // Generate sub directory name randomly (example: BEN6J8VJPDUTWUA)
    String subDirName = RandomStringUtils.randomAlphanumeric(15).toUpperCase();
    // Store ontology from URI or file in /tmp/yampponline/SCENARIO_HASH/source.rdf
    String sourceStoragePath = fileHandler.uploadFile("source", subDirName, request);
    String targetStoragePath = fileHandler.uploadFile("target", subDirName, request);

    // Read ontology with Jena and get ontology JSON model for JavaScript
    Model srcJenaModel = YamppUtils.readUriWithJena(new File(sourceStoragePath).toURI(), Logger.getLogger(Validator.class.getName()));
    Model tarJenaModel = YamppUtils.readUriWithJena(new File(targetStoragePath).toURI(), Logger.getLogger(Validator.class.getName()));
    
    JSONObject sourceOntJson = YamFileHandler.getOntoJsonFromJena(srcJenaModel);
    JSONObject targetOntJson = YamFileHandler.getOntoJsonFromJena(tarJenaModel);
    request.setAttribute("sourceOnt", sourceOntJson);
    request.setAttribute("targetOnt", targetOntJson);

    
    //  In percentage the proportion of a mapped ontology. Given the mapping count
      // Get number of mappings
      HashSet sourceUniqueMappings = new HashSet<>();
      HashSet targetUniqueMappings = new HashSet<>();
      JSONArray alignmentJsonArray = (JSONArray) liste.get("entities");
      // Get all mapped entities in an hashset to get the number of different concepts that have matched (not the number of match)
      for (int i = 0; i < alignmentJsonArray.size(); i++) {
        sourceUniqueMappings.add(((JSONObject) alignmentJsonArray.get(i)).get("entity1").toString());;
        targetUniqueMappings.add(((JSONObject) alignmentJsonArray.get(i)).get("entity2").toString());;
      }
      // number of mapped concept * 100 / number of concept in the ontology
      int srcOverlappingProportion = sourceUniqueMappings.size() * 100 / ((JSONObject) sourceOntJson.get("entities")).size();
      int tarOverlappingProportion = targetUniqueMappings.size() * 100 / ((JSONObject) targetOntJson.get("entities")).size();
      request.setAttribute("srcOverlappingProportion", srcOverlappingProportion);
      request.setAttribute("tarOverlappingProportion", tarOverlappingProportion);
    

    // Call validation.jsp to display results in /validator URL path and send the request with sourceOnt, targetOnt and alignment results
    this.getServletContext().getRequestDispatcher("/WEB-INF/validation.jsp").forward(request, response);
  }
}
