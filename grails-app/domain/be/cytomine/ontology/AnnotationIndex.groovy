package be.cytomine.ontology

import be.cytomine.AnnotationDomain
import be.cytomine.Exception.WrongArgumentException
import be.cytomine.api.UrlApi
import be.cytomine.image.ImageInstance
import be.cytomine.project.Project
import be.cytomine.security.SecUser
import be.cytomine.security.User
import be.cytomine.utils.JSONUtils
import com.vividsolutions.jts.io.WKTReader
import grails.converters.JSON
import org.apache.log4j.Logger

/**
 * An annotation created by a user
 */
class AnnotationIndex implements Serializable {

    SecUser user
    ImageInstance image
    Long countAnnotation
    Long countReviewedAnnotation

    static constraints = {
    }

    static mapping = {
        id generator: "assigned"
        sort "id"
        cache false
    }

    static void registerMarshaller() {
        Logger.getLogger(this).info("Register custom JSON renderer for " + Ontology.class)
        JSON.registerObjectMarshaller(AnnotationIndex) {
            def returnArray = [:]
            returnArray['user'] = it.user.id
            returnArray['algo'] = it.user.algo()
            returnArray['image'] = it.image.id
            returnArray['countAnnotation'] = it.countAnnotation
            returnArray['countReviewedAnnotation'] = it.countReviewedAnnotation
            return returnArray
        }
    }
}
