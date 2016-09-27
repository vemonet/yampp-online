package fr.lirmm.opendata.yamgui;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.semanticweb.owl.align.Alignment;
import org.semanticweb.owl.align.AlignmentVisitor;

import fr.inrialpes.exmo.align.impl.BasicParameters;
import fr.inrialpes.exmo.align.impl.URIAlignment;
import fr.inrialpes.exmo.align.impl.renderer.RDFRendererVisitor;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class Download extends HttpServlet {

  private static final long serialVersionUID = 1L;

  /**
   * Returns validated alignment file to user
   *
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    // Force to get it as a file to download
    response.setContentType("application/force-download");
    response.setHeader("content-disposition", "inline; filename=\"yam_alignment_result.rdf\"");

    response.setCharacterEncoding("UTF-8");
    PrintWriter out = response.getWriter();

    HashMap<String, String> hashMapping = null;
    ArrayList<HashMap> arrayMappings = new ArrayList<>();
    String[] indexArray = request.getParameterValues("index");
    String[] entity1 = request.getParameterValues("entity1");
    String[] entity2 = request.getParameterValues("entity2");
    String[] relation = request.getParameterValues("relation");
    String[] measure = request.getParameterValues("measure");
    String[] valid = request.getParameterValues("valid");

    String alignmentString = null;
    // Put all checked mappings in an Array of Hashtable
    String[] checkbox = request.getParameterValues("checkbox");
    if (checkbox != null && indexArray != null) {
      for (String i : indexArray) {
        // Get the index in param arrays of the validate mappings
        int paramIndex = Arrays.asList(indexArray).indexOf(i);
        hashMapping = new HashMap<>();
        hashMapping.put("entity1", entity1[paramIndex]);
        hashMapping.put("entity2", entity2[paramIndex]);
        hashMapping.put("relation", relation[paramIndex]);
        hashMapping.put("measure", measure[paramIndex]);
        hashMapping.put("valid", valid[paramIndex]);
        arrayMappings.add(hashMapping);
      }
      // Generate the alignment string
      //alignmentString = generateAlignement(arrayMappings);

      String format = request.getParameter("format");
      if (format.equals("simpleRDF")) {
        alignmentString = generateSimpleRdfAlignment(arrayMappings);
        response.setHeader("content-disposition", "inline; filename=\"yam_alignment_result.nt\"");
      } else if (format.equals("RDF")) {
        alignmentString = generateRdfAlignment(arrayMappings);
        response.setHeader("content-disposition", "inline; filename=\"yam_alignment_result.rdf\"");
      } else {
        alignmentString = generateAlignment(arrayMappings);
      }

    } else {
      // in case no checkbox have been checked
      alignmentString = "No mappings have been selectioned";
      response.setContentType("plain/text");
    }

    out.print(alignmentString);
    out.flush();
  }

  /**
   * Generate alignment String retrieved from validation UI to generate the
   * alignment in a simple RDF format (entity1-relation-entity2 triples)
   *
   * @param MapFinal
   * @return
   */
  public static String generateSimpleRdfAlignment(ArrayList<HashMap> MapFinal) {
    String rdfAlignmentString = "";
    for (int i = 0; i < MapFinal.size(); i++) {
      HashMap<String, String> hashMapping = null;
      hashMapping = MapFinal.get(i);
      rdfAlignmentString = rdfAlignmentString + "<" + hashMapping.get("entity1") + "> <" + hashMapping.get("relation") + "> <" + hashMapping.get("entity2") + "> .\n"
              + "<" + hashMapping.get("entity2") + "> <" + hashMapping.get("relation") + "> <" + hashMapping.get("entity1") + "> .\n";
    }
    return rdfAlignmentString;
  }

  /**
   * Generate alignment String retrieved from validation UI to generate the
   * alignment in RDF format
   *
   * @param MapFinal
   * @return
   */
  public static String generateRdfAlignment(ArrayList<HashMap> MapFinal) {
    // create an empty Model
    Model model = ModelFactory.createDefaultModel();
    String alignmentUri = null;
    for (int i = 0; i < MapFinal.size(); i++) {
      HashMap<String, String> hashMapping = null;
      hashMapping = MapFinal.get(i);

      alignmentUri = "http://yamplusplus.lirmm.fr/ontology";

      model.setNsPrefix("align", alignmentUri);

      model.createResource(alignmentUri + "/mapping/" + Integer.toString(i))
              .addProperty(model.createProperty(alignmentUri + "#entity"), hashMapping.get("entity1"))
              .addProperty(model.createProperty(alignmentUri + "#entity"), hashMapping.get("entity2"))
              .addProperty(model.createProperty(alignmentUri + "#relation"), hashMapping.get("relation"))
              .addProperty(model.createProperty(alignmentUri + "#score"), hashMapping.get("measure"));
    }

    StringWriter out = new StringWriter();
    model.write(out);
    return out.toString();
  }

  /**
   * Generate alignment String retrieved from validation UI to generate the
   * alignment in RDF/XML format
   *
   * @param MapFinal
   * @return
   */
  public static String generateAlignment(ArrayList<HashMap> MapFinal) {
    Alignment alignments = new URIAlignment();
    try {
      alignments.init(new URI("c"), new URI("c"));
      alignments.setLevel("0");
      alignments.setType("11");

    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    String errorMessage = "";
    List<String> validArray = new ArrayList();
    for (int i = 0; i < MapFinal.size(); i++) {
      HashMap<String, String> hashMapping = null;
      hashMapping = MapFinal.get(i);
      try {
        URI entity1 = new URI(hashMapping.get("entity1"));
        URI entity2 = new URI(hashMapping.get("entity2"));

        double score = Double.parseDouble(hashMapping.get("measure"));

        String relation = hashMapping.get("relation");
        validArray.add(hashMapping.get("valid"));

        // add to alignment
        alignments.addAlignCell(entity1, entity2, relation, score);

        //errorMessage = errorMessage + " SCORE " + score + " ENTITY1 " + entity1 + " ENTITY2 " + entity2 + " RELATION " + relation;
      } catch (Exception e) {
        // TODO Auto-generated catch block
        errorMessage = errorMessage + " getMessage: " + e.getMessage() + " ERROR: " + e;
        e.printStackTrace();
      }
    }
    try {
      StringWriter swriter = new StringWriter();
      PrintWriter writer = new PrintWriter(swriter);

      // create an alignment visitor (renderer)
      AlignmentVisitor renderer = new RDFRendererVisitor(writer);
      renderer.init(new BasicParameters());

      alignments.render(renderer);
      alignments.clone();
      String alignmentString = swriter.toString();
      swriter.flush();
      swriter.close();
      //return alignmentString;
      return alignmentString;
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return "0";
    }

  }
}
