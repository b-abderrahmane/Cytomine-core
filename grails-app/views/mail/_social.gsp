<table class="social" width="100%">
    <tr>
        <td>

            <!-- column 1 -->
            <table align="left" class="column">
                <tr>
                    <td>
                        <h5 class="">Contact Info:</h5>
                        <p>Website : <a href="<%= website %>"><%= website %></a><br/>
                            Email : <a mailto="<%= mailFrom %>"><%= mailFrom %></a><br/>
                            <g:if test="${phoneNumber && phoneNumber.trim() != ""}">
                                Phone: <strong><%= phoneNumber %><</strong><br/>
                            </g:if>
                        </p>
                    </td>
                </tr>
            </table><!-- /column 1 -->

        <!-- column 2 -->
            <table align="left" class="column">
                <tr>
                    <td>

                        <h5 class="">Follow the Cytomine project:</h5>
                        <p class="">
                            <a href="https://www.facebook.com/Cytomine" class="soc-btn fb">Facebook</a>
                            <a href="https://twitter.com/cytomine" class="soc-btn tw">Twitter</a>
                            <a href="https://www.linkedin.com/company/cytomine" class="soc-btn ln">LinkedIn</a>
                            <a href="https://www.youtube.com/channel/UCUrNbUEwQkAW32nimsVR69g" class="soc-btn yt">Youtube</a>
                        </p>
                    </td>
                </tr>
            </table><!-- /column 2 -->

            <span class="clear"></span>

        </td>
    </tr>
</table><!-- /social & contact -->
