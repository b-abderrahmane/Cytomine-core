package be.cytomine.ontology

import be.cytomine.AnnotationDomain
import be.cytomine.Exception.WrongArgumentException
import be.cytomine.command.AddCommand
import be.cytomine.command.Command
import be.cytomine.command.DeleteCommand
import be.cytomine.command.Transaction
import be.cytomine.security.SecUser
import be.cytomine.utils.ModelService
import be.cytomine.utils.Task

import static org.springframework.security.acls.domain.BasePermission.READ

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

class AnnotationTrackService extends ModelService {

    static transactional = true

    def securityACLService
    def imageInstanceService

    def currentDomain() {
        AnnotationTrack
    }

    def read(def id) {
        AnnotationTrack annotationTrack = AnnotationTrack.read(id)
        if (annotationTrack) {
            securityACLService.check(annotationTrack, READ)
        }
        annotationTrack
    }

    def read(AnnotationDomain annotation, Track track) {
        AnnotationTrack annotationTrack = AnnotationTrack.findByAnnotationIdentAndTrack(annotation.id, track)
        if (annotationTrack) {
            securityACLService.check(annotationTrack, READ)
        }
        annotationTrack
    }

    def list(Track track) {
        securityACLService.check(track, READ)
        AnnotationTrack.findAllByTrack(track)
    }

    def list(AnnotationDomain annotation) {
        securityACLService.check(annotation, READ)
        AnnotationTrack.findAllByAnnotationIdent(annotation.id)
    }

    def add(def json) {
        AnnotationDomain annotation = AnnotationDomain.getAnnotationDomain(json.annotationIdent, json.annotationClassName)
        if (!annotation) {
            throw new WrongArgumentException("Annotation does not have a valid project.")
        }
        securityACLService.check(annotation .project, READ)
        securityACLService.checkisNotReadOnly(annotation.project)
        json.slice = annotation.slice.id

        SecUser currentUser = cytomineService.getCurrentUser()
        Command c = new AddCommand(user: currentUser)
        executeCommand(c, null, json)
    }

    def delete(AnnotationTrack annotationTrack, Transaction transaction = null, Task task = null, boolean printMessage = true) {
//        securityACLService.checkAtLeastOne(track, READ)
        //TODO security
        SecUser currentUser = cytomineService.getCurrentUser()
        Command c = new DeleteCommand(user: currentUser, transaction: transaction)
        executeCommand(c, annotationTrack, null)
    }

    def getStringParamsI18n(def domain) {
        return [domain.id, domain.annotationIdent, domain.track]
    }
}
