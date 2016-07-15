<%@include file="header.jsp" %>

	<div class="sideLeft"></div>

	<div class=sideMiddle>

		<h3 class=contentText>Select your ontologies.</h3>
		<div class=form>
			<form action="result" method="post"
				enctype="multipart/form-data" name=form
				onsubmit="document.location.href = '#overlay';">

                                <button type="button" class="btn btn-sm btn-info" onclick="getExample()">Fill with example</button>
                                <br/><br/>
                                
                                <div class="alert alert-warning" role="alert">
                                  The version of YAM++ used in this app is not optimized for big ontologies.<br/>
                                  So it may crash :D
                                </div>
                          
                                <div class="row">

                                  <div class="col-md-6">
                                    <label for=firstFile>Ontology 1</label> <br/>
                                    <input type="url" id="sourceUrl1" name="sourceUrl1" placeholder="Enter ontology URL"/>
                                    <br/>
                                    <span style="text-align: center">or</span> <br/>
                                    <label class="btn btn-info btn-file">
                                      Choose file
                                      <input id=ont1 type="file" name="ont1" accept=".owl, .rdf, .nt, .ttl, .jsonld, .json" onchange="refreshFileUpload('ont1', 'fileOnt1');" style="display: none;"/>
                                    </label> <br/>
                                    <label id="fileOnt1" style="font-weight: normal;"></label>
                                  </div>
                                  <div class="col-md-6">
                                    <label for=secondFile>Ontology 2</label> <br/>
                                    <input type="url" id="sourceUrl2" name="sourceUrl2" placeholder="Enter ontology URL"/>
                                    <br/>
                                    <span style="text-align: center">or</span> <br/>
                                    <label id="labelOnt2" class="btn btn-info btn-file">
                                      Choose file
                                      <input id=ont2 type="file" name="ont2" accept=".owl, .rdf, .nt, .ttl, .jsonld, .json" onchange="refreshFileUpload('ont2', 'fileOnt2');" style="display: none;" />
                                    </label> <br/>
                                    <label id="fileOnt2" style="font-weight: normal;"></label>
                                  </div>
                                </div>
				<br/><br/>
                                <label style="font-weight: normal;"><input type="checkbox" id=saveFile name="saveFile" checked>I agree to let YAM++ save my ontologies</label>
                                <br/><br/>
                                <input class=btn type="submit" value="Match!" />
			</form>
		</div>

		<div class=btnMatch id=btnMatch style="display: none;">
			<form action="result"
				method="post" name=runMatch
				onsubmit="document.location.href = '#overlay';">

				I'm agreeing to let YAM++ save my ontologies.<input type="radio"
					name="saveOption" value="yes" checked>Yes <input
					type="radio" name="saveOption" value="no">No <br> <br>
				<input class=btn type="submit" value="Match!" />
			</form>
		</div>
		<div id="overlay">
			<div class="popup_block">
				<img width=300 alt="" src="images/loading-blue.gif">
				<p class=popup_text>
					Please wait while matching.<br>This can take a while...
				</p>
			</div>
		</div>

		<hr>

	</div>
	<div class="sideRight"></div>
        
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script type="text/javascript">
          /**
           * Fill sourceUrl fields with default ontologies from BioPortal
           */
          function getExample()
          {
            document.getElementById('sourceUrl1').value = "http://data.bioportal.lirmm.fr/ontologies/CIF/download?apikey=7b82f0a5-a784-494c-9d2e-cae6698099db";
            document.getElementById('sourceUrl2').value = "http://data.bioportal.lirmm.fr/ontologies/MEDLINEPLUS/download?apikey=7b82f0a5-a784-494c-9d2e-cae6698099db";
          }
        </script>
        
<%@include file="footer.jsp" %>