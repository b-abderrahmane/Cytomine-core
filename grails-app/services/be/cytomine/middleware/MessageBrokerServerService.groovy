package be.cytomine.middleware

/*
* Copyright (c) 2009-2021. Authors: see NOTICE file.
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

import be.cytomine.Exception.CytomineException
import be.cytomine.command.*
import be.cytomine.security.SecUser
import be.cytomine.utils.ModelService
import be.cytomine.utils.Task

/**
 * Created by jconfetti on 04/02/15.
 */
class MessageBrokerServerService extends ModelService{

    static transactionService = true
    boolean saveOnUndoRedoStack = true

    def securityACLService

    def permissionService

    def currentDomain() {
        return MessageBrokerServer
    }

    MessageBrokerServer get(def id) {
        MessageBrokerServer.get(id)
    }

    MessageBrokerServer read(def id) {
        MessageBrokerServer messageBrokerServer = MessageBrokerServer.read(id)

        messageBrokerServer
    }

    def list() {
        MessageBrokerServer.list()
    }
    def list(String name) {
        MessageBrokerServer.findAllByNameIlike("%$name%")
    }

    /**
     * Add the new domain with JSON data
     * @param json New domain data
     * @return Response structure (created domain data,..)
     */
    def add(def json) throws CytomineException {
        SecUser currentUser = cytomineService.getCurrentUser()
        securityACLService.checkAdmin(currentUser)
        return executeCommand(new AddCommand(user: currentUser), null, json)
    }

    /**
     * Update this domain with new data from json
     * @param domain Domain to update
     * @param jsonNewData New domain data
     * @return Response structure (new domain data, old domain data..)
     */
    def update(MessageBrokerServer domain, def json) throws CytomineException {
        SecUser currentUser = cytomineService.getCurrentUser()
        securityACLService.checkAdmin(currentUser)
        return executeCommand(new EditCommand(user: currentUser), domain, json)
    }

    /**
     * Delete this domain
     * @param domain Domain to delete
     * @param transaction Transaction link with this command
     * @param task Task for this command
     * @param printMessage Flag if client will print or not confirm message
     * @return Response structure (code, old domain,..)
     */
    def delete(MessageBrokerServer domain, Transaction transaction = null, Task task = null, boolean printMessage = true) {
        SecUser currentUser = cytomineService.getCurrentUser()
        securityACLService.checkAdmin(currentUser)
        Command c = new DeleteCommand(user: currentUser,transaction:transaction)
        return executeCommand(c,domain,null)
    }

    def getStringParamsI18n(def domain) {
        return [domain.id, domain.host, domain.port]
    }

    def getMessageBrokerServerByHost(String host) {
        MessageBrokerServer.findByHost(host)
    }

}
