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
        Sign transaction
      </v-card-title>
      <v-card-text>
        <span v-if='publicKey === ""' class='font-weight-bold text-h6'>Please get an account above first</span>
        <v-textarea label="Transaction" class="mt-2" :readonly='true' v-model='transactionJSON'/>
        <v-textarea label="Signed transaction" :readonly='true' v-model='signedTransactionJSON'/>
        <span>Is signed deploy valid ? {{signedTransaction ? validateTransaction : "No signed transaction yet"}}</span>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='signTransaction' :disabled='publicKey === ""'>Sign transaction</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>
        Sign transfer
      </v-card-title>
      <v-card-text>
        <span v-if='publicKey === ""' class='font-weight-bold text-h6'>Please get an account above first</span>
        <v-textarea label="Transfer" class="mt-2" :readonly='true' v-model='transferJSON'/>
        <v-textarea label="Signed transfer" :readonly='true' v-model='signedTransferJSON'/>
        <span>Is signed deploy valid ? {{signedTransfer ? validateTransfer : "No signed Transfer yet"}}</span>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='signTransfer' :disabled='publicKey === ""'>Sign Transfer</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>
        Sign fake deploy all args
      </v-card-title>
      <v-card-text>
        <span v-if='publicKey === ""' class='font-weight-bold text-h6'>Please get an account above first</span>
        <v-textarea label="Deploy" class="mt-2" :readonly='true' v-model='deployArgsJSON'/>
        <v-textarea label="Signed deploy" :readonly='true' v-model='signedDeployArgsJSON'/>
        <span>Is signed deploy valid ? {{signedDeployArgs ? validateDeployArgs : "No signed deploy yet"}}</span>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='signDeployArgs' :disabled='publicKey === ""'>Sign deploy</v-btn>
      </v-card-actions>
    </v-card>
    <v-card>
      <v-card-title>
        Sign message
      </v-card-title>
      <v-card-text>
        <v-text-field label="Message" v-model='message'/>
        <v-text-field label="Signature" :readonly='true' v-model='messageSignature'/>
        <span>Is signed message valid ? {{messageSignature ? validateMessage : "No signed message yet"}}</span>
      </v-card-text>
      <v-card-actions>
        <v-btn @click='signMessage'>Sign</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import {getAccount, signDeploy, signMessage, signTransaction} from '../../../lib/src/casper-manager-helper';
import { installSnap, getSnap } from '../../../lib/src/snap';
import {
  Deploy,
  DeployHeader,
  Duration,
  PublicKey,
  Timestamp, TransactionV1
} from "casper-js-sdk";
import {
  fakeModuleBytesTransaction,
  fakeStoredVersionContractByHash,
  fakeTransfer
} from "../../../snap/test/integration/utils";

export default {
  name: 'Home',
  data: () => ({
    account: 0,
    publicKey: "",
    transaction: null,
    transfer: null,
    deployArgs: null,
    signedTransaction: null,
    signedTransfer: null,
    signedDeployArgs: null,
    message: "test",
    messageSignature: "",
    snapId: "local:http://localhost:8000/",
    snapInfo: null,
  }),
  computed: {
    transactionJSON() {
      try {
        return JSON.stringify(TransactionV1.toJSON(this.transaction), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    transferJSON() {
      try {
        return JSON.stringify(Deploy.toJSON(this.transfer), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    deployArgsJSON() {
      try {
        return JSON.stringify(Deploy.toJSON(this.deployArgs), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    signedDeployArgsJSON() {
      try {
        return JSON.stringify(Deploy.toJSON(this.signedDeployArgs), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    signedTransactionJSON() {
      try {
        return JSON.stringify(TransactionV1.toJSON(this.signedTransaction), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    signedTransferJSON() {
      try {
        return JSON.stringify(Deploy.toJSON(this.signedTransfer), null, 4);
      } catch (e: any) {
        return e.message;
      }
    },
    validateTransaction() {
      return this.signedTransaction.validate() ? "Valid signed transaction" : "Invalid signed transaction";
    },
    validateDeployArgs() {
      return this.signedDeployArgs.validate() ? "Valid signed deploy" : "Invalid signed deploy";
    },
    validateTransfer() {
      return this.signedTransfer.validate() ? "Valid signed transfer" : "Invalid signed transfer";
    },
    validateMessage() {
      const pk = PublicKey.fromHex(this.publicKey);
      const msg = Uint8Array.from(
        Buffer.from(`Casper Message:\n${this.message}`),
      );
      const msgSignature = Buffer.from(this.messageSignature, "hex");
      try {
        if(pk.verifySignature(msg, msgSignature)) {
          return "Valid signed message"
        }
      } catch (e) {
        console.error(e);
      }
      return "Invalid signed message";
    }
  },
  watch: {
    publicKey() {
      if (this.publicKey !== "") {

        const header = new DeployHeader(
          'casper',
          [],
          1,
          new Timestamp(new Date()),
          new Duration(3600000),
        );
        header.account = PublicKey.fromHex(this.publicKey);

        this.transaction = fakeModuleBytesTransaction(this.publicKey);
        this.deployArgs = fakeStoredVersionContractByHash(this.publicKey);
        this.transfer = fakeTransfer(this.publicKey);
      }
    }
  },
  async mounted() {
    this.snapInfo = await getSnap(this.snapId);
  },
  methods: {
    async installSnap() {
      await installSnap(this.snapId);
      await getSnap(this.snapId);
    },
    async getSnap() {
      await getSnap(this.snapId);
    },
    async getAccount() {
      this.publicKey = (await getAccount(this.account, this.snapId) as PublicKey).toHex();
    },
    async signMessage() {
      this.messageSignature = await signMessage(this.message, {addressIndex: this.account, snapID: this.snapId});
    },
    async signTransaction() {
      this.signedTransaction = await signTransaction(this.transaction, {addressIndex: this.account, snapID: this.snapId});
    },
    async signDeployArgs() {
      this.signedDeployArgs = await signDeploy(this.deployArgs, {addressIndex: this.account, snapID: this.snapId});
    },
    async signTransfer() {
      this.signedTransfer = await signDeploy(this.transfer, {addressIndex: this.account, snapID: this.snapId});
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
