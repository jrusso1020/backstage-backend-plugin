/*
 * Copyright 2021 Cortex Applications Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { CortexApi } from "./CortexApi";
import { Entity } from '@backstage/catalog-model';
import { PluginEndpointDiscovery } from '@backstage/backend-common';

const fetch = require("node-fetch");

type Options = {
  discoveryApi: PluginEndpointDiscovery;
};

export class CortexClient implements CortexApi {
  private readonly discoveryApi: PluginEndpointDiscovery;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  async syncEntities(entities: Entity[]): Promise<void> {
    return await this.post(`/api/internal/v1/backstage`, { entities: entities })
  }

  private async getBasePath(): Promise<string> {
    const proxyBasePath = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyBasePath}/cortex`
  }

  private async post(path: string, body?: any): Promise<any | undefined> {
    const basePath = await this.getBasePath();
    const url = `${basePath}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });

    const responseBody = await response.json();
    if (response.status !== 200) {
      throw new Error(
        `Error communicating with Cortex: ${JSON.stringify(responseBody)}`,
      );
    }

    return responseBody;
  }
}