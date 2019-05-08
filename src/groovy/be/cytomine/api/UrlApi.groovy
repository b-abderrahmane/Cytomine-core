package be.cytomine.api

import be.cytomine.image.AbstractImage

/*
* Copyright (c) 2009-2019. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import grails.util.Holders

/**
 * Created by IntelliJ IDEA.
 * User: lrollus
 * Date: 1/03/11
 * Time: 13:33
 * Utility class to build url for specific data.
 * Some service has special url. E.g. An annotation can be downloaded via a jpg file from url.
 */
class UrlApi {

    def grailsApplication

    static def getApiURL(String type, Long id) {
        return "${serverUrl()}/api/$type/${id}.json"
    }

    static def getUserAnnotationCropWithAnnotationId(Long idAnnotation, def format="png") {
        return "${serverUrl()}/api/userannotation/$idAnnotation/crop.$format"
    }

    static def getUserAnnotationCropWithAnnotationIdWithMaxSize(Long idAnnotation, int maxSize = 256, def format="png") {
        return "${serverUrl()}/api/userannotation/$idAnnotation/crop.$format?maxSize=$maxSize"
    }

    static def getROIAnnotationCropWithAnnotationId(Long idAnnotation, def format="png") {
        return "${serverUrl()}/api/roiannotation/$idAnnotation/crop.$format"
    }

    static def getROIAnnotationCropWithAnnotationIdWithMaxSize(Long idAnnotation, int maxSize = 256, def format="png") {
        return "${serverUrl()}/api/roiannotation/$idAnnotation/crop.$format?maxSize=$maxSize"
    }

    static def getAlgoAnnotationCropWithAnnotationId(Long idAnnotation, def format="png") {
        return "${serverUrl()}/api/algoannotation/$idAnnotation/crop.$format"
    }

    static def getAlgoAnnotationCropWithAnnotationIdWithMaxSize(Long idAnnotation, int maxsize = 256, def format="png") {
        return "${serverUrl()}/api/algoannotation/$idAnnotation/crop.$format?maxSize=$maxsize"
    }

    static def getReviewedAnnotationCropWithAnnotationId(Long idAnnotation, def format="png") {
        return "${serverUrl()}/api/reviewedannotation/$idAnnotation/crop.$format"
    }

    static def getReviewedAnnotationCropWithAnnotationIdWithMaxSize(Long idAnnotation, int maxSize = 256, def format="png") {
        return "${serverUrl()}/api/reviewedannotation/$idAnnotation/crop.$format?maxSize=$maxSize"
    }

    static def getAnnotationCropWithAnnotationId(Long idAnnotation, def maxSize = null, def format="png") {
        return "${serverUrl()}/api/annotation/$idAnnotation/crop.$format" + (maxSize? "?maxSize=$maxSize" :"")
    }

    static def getCompleteAnnotationCropDrawedWithAnnotationId(Long idAnnotation, def maxSize = null) {
        String params = (maxSize ? "maxSize=$maxSize&" : "") + "draw=true&complete=true"
        return "${serverUrl()}/api/annotation/$idAnnotation/crop.png?" + params
    }

    static def getAssociatedImage(Long idAbstractImage, String label, def maxSize = null, def format="png") {
//        if(label == "macro") {
//            AbstractImage abstractImage = AbstractImage.read(idAbstractImage)
//            if(["image/pyrtiff", "image/tiff", "image/tif", "image/jp2"].contains(abstractImage?.mimeType)) return null
//        }
        String size = maxSize ? "?maxWidth=$maxSize" : "";
        return "${serverUrl()}/api/abstractimage/$idAbstractImage/associated/$label.$format$size"
    }

    static def getAbstractImageThumbUrl(Long idImage, def format="png") {
        return  "${serverUrl()}/api/abstractimage/$idImage/thumb.$format"
    }

    static def getAbstractImageThumbUrlWithMaxSize(Long idAbstractImage, def maxSize = 256, def format="png") {
        return "${serverUrl()}/api/abstractimage/$idAbstractImage/thumb.$format?maxSize=$maxSize"
    }

    static def getAbstractSliceThumbUrl(Long idSlice, def format="png") {
        return "${serverUrl()}/api/abstractslice/$idSlice/thumb.$format"
    }

    static def getImageGroupThumbUrlWithMaxSize(Long idImageGroup, def maxSize = 256, def format="png") {
        return "${serverUrl()}/api/imagegroup/$idImageGroup/thumb.$format?maxSize=$maxSize"
    }

    static def getAnnotationURL(Long idProject, Long idImage, Long idAnnotation) {
        return  "${UIUrl()}/#/project/$idProject/image/$idImage/annotation/$idAnnotation"
    }

    static def getBrowseImageInstanceURL(Long idProject, Long idImage) {
        return  "${UIUrl()}/#/project/$idProject/image/$idImage"
    }

    static def getDashboardURL(Long idProject) {
        return  "${UIUrl()}/#/project/$idProject"
    }

    /**
     * Return cytomine url to access an image thumb
     * @param url  Cytomine base url
     * @param idImage Image id
     * @return full cytomine url
     */
    static def getAbstractImageThumbURL(Long idImage) {
        return  "${serverUrl()}/api/abstractimage/$idImage/thumb.png"
    }

    static def serverUrl() {
        Holders.getGrailsApplication().config.grails.serverURL
    }

    static def UIUrl() {
        return Holders.getGrailsApplication().config.grails.UIURL?:serverUrl()
    }
}
