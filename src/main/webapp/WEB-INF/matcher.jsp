<%@include file="header.jsp" %>
	
	<script>
		createCookie(0);
	</script>

	<div class="sideLeft"></div>

	<div class=sideMiddle>

		<h3 class=contentText>Select your ontologies.</h3>
		<div class=form>
			<form action="result" method="post"
				enctype="multipart/form-data" name=form
				onsubmit="document.location.href = '#overlay';">
                          
                                <div class="row">

                                  <div class="col-md-6">
                                    <label for=firstFile>Source ontology</label> <br/>
                                    <input type="url" id="sourceUrl1" name="sourceUrl1" placeholder="Enter ontology URL"/>
                                    <br/>
                                    <span style="text-align: center">or</span> <br/>
                                    <label class="btn btn-info btn-file">
                                      Choose file
                                      <input id=ont1 type="file" name="ont1" accept=".owl" onchange="refreshOnt('ont1');" style="display: none;" required />
                                    </label> <br/>
                                    <label id="fileOnt1" style="font-weight: normal;"></label>
                                  </div>
                                  <div class="col-md-6">
                                    <label for=secondFile>Target ontology&nbsp;</label> <br/>
                                    <input type="url" id="sourceUrl2" name="sourceUrl2" placeholder="Enter ontology URL"/>
                                    <br/>
                                    <span style="text-align: center">or</span> <br/>
                                    <label id="labelOnt2" class="btn btn-info btn-file">
                                      Choose file
                                      <input id=ont2 type="file" name="ont2" accept=".owl" onchange="refreshOnt('ont2');" style="display: none;" />
                                    </label> <br/>
                                    <label id="fileOnt2" style="font-weight: normal;"></label>
                                  </div>
                                </div>
				<br/><br/>
                                <label style="font-weight: normal;"><input type="checkbox" value="save" checked>I'm agreeing to let YAM++ save my ontologies</label>
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
        <script>
          /**
           * Function to update file label
           * @param {type} ontName
           * @returns {undefined}
           */
          function refreshOnt(ontName) {
            var path = document.getElementById(ontName).value;
            var fileName = path.match(/[^\/\\]+$/);
            $('#' + 'file' + ontName[0].toUpperCase() + ontName.slice(1)).html(fileName);
          }
        </script>
        
<%@include file="footer.jsp" %>