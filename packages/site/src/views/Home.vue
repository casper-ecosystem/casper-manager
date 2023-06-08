<template>
  <v-container>
    <v-card>
      <v-card-title>
        Install snap
      </v-card-title>
      <v-card-text>
        <span v-if='!snapInfo'>The snap isn't installed.</span>
        <template v-if='snapInfo'>
          The snap is installed.<br/>
          Blocked: {{snapInfo.blocked}}<br/>
          Enabled: {{snapInfo.enabled}}<br/>
          Version: {{snapInfo.version}}<br/>
          Permissions: <br/>
          <v-textarea :model-value='JSON.stringify(snapInfo.initialPermissions, null, 4)' :readonly='true'/>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='installSnap'>Install</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>
        Get account
      </v-card-title>
      <v-card-text>
        <v-text-field label="Account" v-model='account'/>
        <v-textarea label="Public key" :readonly='true' v-model='publicKey'/>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='getAccount'>Get account</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>
        Sign deploy
      </v-card-title>
      <v-card-text>
        <span v-if='publicKey === ""' class='font-weight-bold text-h6'>Please get an account above first</span>
        <v-textarea label="Deploy" class="mt-2" :readonly='true' v-model='deployJSON'/>
        <v-textarea label="Signed deploy" :readonly='true' v-model='signedDeployJSON'/>
        <span>Is signed deploy valid ? {{signedDeploy ? validateDeploy : "No signed deploy yet"}}</span>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='signDeploy' :disabled='publicKey === ""'>Sign deploy</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>
        Sign message
      </v-card-title>
      <v-card-text>
        <v-text-field label="Message" v-model='message'/>
        <v-text-field label="Signature" :readonly='true' v-model='messageSignature'/>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='signMessage'>Sign</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { getAccount, signDeploy, signMessage } from '../../../lib/src/casper-manager-helper';
import { installSnap, getSnap } from '../../../lib/src/snap';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';

export default {
  name: 'Home',
  data: () => ({
    account: 0,
    publicKey: "",
    deploy: undefined,
    signedDeploy: undefined,
    message: "test",
    messageSignature: "",
    snapId: "local:http://localhost:9000/",
    snapInfo: undefined,
  }),
  computed: {
    deployJSON() {
      try {
        return JSON.stringify(DeployUtil.deployToJson(this.deploy), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    signedDeployJSON() {
      try {
        return JSON.stringify(DeployUtil.deployToJson(this.signedDeploy), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    validateDeploy() {
      return DeployUtil.validateDeploy(this.signedDeploy).ok ? "Valid signed deploy" : "Invalid signed deploy";
    }
  },
  async mounted() {
    this.snapInfo = await getSnap(this.snapId);
  },
  watch: {
    publicKey() {
      this.deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(CLPublicKey.fromHex(this.publicKey), 'casper', 1, 3600000),
        DeployUtil.ExecutableDeployItem.newTransfer(
          1,
          CLPublicKey.fromHex(
            '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
          ),
          undefined,
          0,
        ),
        DeployUtil.standardPayment(1),
      );
    }
  },
  methods: {
    async installSnap() {
      await installSnap(this.snapId);
      await getSnap();
    },
    async getSnap() {
      await getSnap(this.snapId);
    },
    async getAccount() {
      this.publicKey = (await getAccount(parseInt(this.account), this.snapId) as CLPublicKey).toHex();
    },
    async signMessage() {
      this.messageSignature = await signMessage(this.message, {addressIndex: parseInt(this.account), snapID: this.snapId});
    },
    async signDeploy() {
      this.signedDeploy = await signDeploy(this.deploy, {addressIndex: parseInt(this.account), snapID: this.snapId});
    },
  }
}
</script>

<style>
.v-card {
  margin-bottom: 14px;
  margin-top: 14px;
}
</style>
