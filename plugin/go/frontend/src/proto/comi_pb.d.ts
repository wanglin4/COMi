import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace types. */
export namespace types {

    /**
     * Properties of a Transaction.
     * @deprecated Use types.Transaction.$Properties instead.
     */
    interface ITransaction extends types.Transaction.$Properties {
    }

    /** Represents a Transaction. */
    class Transaction {

        /**
         * Constructs a new Transaction.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Transaction.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Transaction messageType. */
        messageType: string;

        /** Transaction msg. */
        msg?: (google.protobuf.Any.$Properties|null);

        /** Transaction signature. */
        signature?: (types.Signature.$Properties|null);

        /** Transaction createdHeight. */
        createdHeight: (number|Long);

        /** Transaction time. */
        time: (number|Long);

        /** Transaction fee. */
        fee: (number|Long);

        /** Transaction memo. */
        memo: string;

        /** Transaction networkId. */
        networkId: (number|Long);

        /** Transaction chainId. */
        chainId: (number|Long);

        /** Transaction nonce. */
        nonce: (number|Long);

        /**
         * Creates a new Transaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transaction instance
         */
        static create(properties: types.Transaction.$Shape): types.Transaction & types.Transaction.$Shape;
        static create(properties?: types.Transaction.$Properties): types.Transaction;

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Transaction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Transaction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Transaction & types.Transaction.$Shape} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Transaction & types.Transaction.$Shape;

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Transaction & types.Transaction.$Shape} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Transaction & types.Transaction.$Shape;

        /**
         * Verifies a Transaction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transaction
         */
        static fromObject(object: { [k: string]: any }): types.Transaction;

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @param message Transaction
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Transaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transaction to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Transaction
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Transaction {

        /** Properties of a Transaction. */
        interface $Properties {

            /** Transaction messageType */
            messageType?: (string|null);

            /** Transaction msg */
            msg?: (google.protobuf.Any.$Properties|null);

            /** Transaction signature */
            signature?: (types.Signature.$Properties|null);

            /** Transaction createdHeight */
            createdHeight?: (number|Long|null);

            /** Transaction time */
            time?: (number|Long|null);

            /** Transaction fee */
            fee?: (number|Long|null);

            /** Transaction memo */
            memo?: (string|null);

            /** Transaction networkId */
            networkId?: (number|Long|null);

            /** Transaction chainId */
            chainId?: (number|Long|null);

            /** Transaction nonce */
            nonce?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Transaction. */
        type $Shape = types.Transaction.$Properties;
    }

    /**
     * Properties of a MessageSend.
     * @deprecated Use types.MessageSend.$Properties instead.
     */
    interface IMessageSend extends types.MessageSend.$Properties {
    }

    /** Represents a MessageSend. */
    class MessageSend {

        /**
         * Constructs a new MessageSend.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageSend.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageSend fromAddress. */
        fromAddress: Uint8Array;

        /** MessageSend toAddress. */
        toAddress: Uint8Array;

        /** MessageSend amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageSend instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageSend instance
         */
        static create(properties: types.MessageSend.$Shape): types.MessageSend & types.MessageSend.$Shape;
        static create(properties?: types.MessageSend.$Properties): types.MessageSend;

        /**
         * Encodes the specified MessageSend message. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @param message MessageSend message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageSend.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageSend message, length delimited. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @param message MessageSend message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageSend.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageSend message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageSend & types.MessageSend.$Shape} MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageSend & types.MessageSend.$Shape;

        /**
         * Decodes a MessageSend message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageSend & types.MessageSend.$Shape} MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageSend & types.MessageSend.$Shape;

        /**
         * Verifies a MessageSend message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageSend message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageSend
         */
        static fromObject(object: { [k: string]: any }): types.MessageSend;

        /**
         * Creates a plain object from a MessageSend message. Also converts values to other types if specified.
         * @param message MessageSend
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageSend to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageSend
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageSend {

        /** Properties of a MessageSend. */
        interface $Properties {

            /** MessageSend fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageSend toAddress */
            toAddress?: (Uint8Array|null);

            /** MessageSend amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageSend. */
        type $Shape = types.MessageSend.$Properties;
    }

    /**
     * Properties of a FeeParams.
     * @deprecated Use types.FeeParams.$Properties instead.
     */
    interface IFeeParams extends types.FeeParams.$Properties {
    }

    /** Represents a FeeParams. */
    class FeeParams {

        /**
         * Constructs a new FeeParams.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.FeeParams.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** FeeParams sendFee. */
        sendFee: (number|Long);

        /**
         * Creates a new FeeParams instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FeeParams instance
         */
        static create(properties: types.FeeParams.$Shape): types.FeeParams & types.FeeParams.$Shape;
        static create(properties?: types.FeeParams.$Properties): types.FeeParams;

        /**
         * Encodes the specified FeeParams message. Does not implicitly {@link types.FeeParams.verify|verify} messages.
         * @param message FeeParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.FeeParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FeeParams message, length delimited. Does not implicitly {@link types.FeeParams.verify|verify} messages.
         * @param message FeeParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.FeeParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FeeParams message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.FeeParams & types.FeeParams.$Shape} FeeParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.FeeParams & types.FeeParams.$Shape;

        /**
         * Decodes a FeeParams message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.FeeParams & types.FeeParams.$Shape} FeeParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.FeeParams & types.FeeParams.$Shape;

        /**
         * Verifies a FeeParams message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FeeParams message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FeeParams
         */
        static fromObject(object: { [k: string]: any }): types.FeeParams;

        /**
         * Creates a plain object from a FeeParams message. Also converts values to other types if specified.
         * @param message FeeParams
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.FeeParams, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FeeParams to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for FeeParams
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace FeeParams {

        /** Properties of a FeeParams. */
        interface $Properties {

            /** FeeParams sendFee */
            sendFee?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a FeeParams. */
        type $Shape = types.FeeParams.$Properties;
    }

    /**
     * Properties of a Signature.
     * @deprecated Use types.Signature.$Properties instead.
     */
    interface ISignature extends types.Signature.$Properties {
    }

    /** Represents a Signature. */
    class Signature {

        /**
         * Constructs a new Signature.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Signature.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Signature publicKey. */
        publicKey: Uint8Array;

        /** Signature signature. */
        signature: Uint8Array;

        /**
         * Creates a new Signature instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Signature instance
         */
        static create(properties: types.Signature.$Shape): types.Signature & types.Signature.$Shape;
        static create(properties?: types.Signature.$Properties): types.Signature;

        /**
         * Encodes the specified Signature message. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @param message Signature message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Signature.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @param message Signature message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Signature.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Signature & types.Signature.$Shape} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Signature & types.Signature.$Shape;

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Signature & types.Signature.$Shape} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Signature & types.Signature.$Shape;

        /**
         * Verifies a Signature message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Signature
         */
        static fromObject(object: { [k: string]: any }): types.Signature;

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @param message Signature
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Signature, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Signature to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Signature
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Signature {

        /** Properties of a Signature. */
        interface $Properties {

            /** Signature publicKey */
            publicKey?: (Uint8Array|null);

            /** Signature signature */
            signature?: (Uint8Array|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Signature. */
        type $Shape = types.Signature.$Properties;
    }

    /** AssetClass enum. */
    enum AssetClass {

        /** ASSET_CLASS_UNSPECIFIED value */
        ASSET_CLASS_UNSPECIFIED = 0,

        /** ASSET_CLASS_RWA value */
        ASSET_CLASS_RWA = 1,

        /** ASSET_CLASS_BOND value */
        ASSET_CLASS_BOND = 2,

        /** ASSET_CLASS_SYNTH value */
        ASSET_CLASS_SYNTH = 3
    }

    /** GatePolicy enum. */
    enum GatePolicy {

        /** GATE_POLICY_UNSPECIFIED value */
        GATE_POLICY_UNSPECIFIED = 0,

        /** GATE_POLICY_ALLOWLIST value */
        GATE_POLICY_ALLOWLIST = 1,

        /** GATE_POLICY_ATTESTER value */
        GATE_POLICY_ATTESTER = 2,

        /** GATE_POLICY_OPEN value */
        GATE_POLICY_OPEN = 3
    }

    /**
     * Properties of an Asset.
     * @deprecated Use types.Asset.$Properties instead.
     */
    interface IAsset extends types.Asset.$Properties {
    }

    /** Represents an Asset. */
    class Asset {

        /**
         * Constructs a new Asset.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Asset.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Asset id. */
        id: (number|Long);

        /** Asset symbol. */
        symbol: string;

        /** Asset class. */
        class: types.AssetClass;

        /** Asset issuer. */
        issuer: Uint8Array;

        /** Asset gatePolicy. */
        gatePolicy: types.GatePolicy;

        /** Asset tier. */
        tier: number;

        /**
         * Creates a new Asset instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Asset instance
         */
        static create(properties: types.Asset.$Shape): types.Asset & types.Asset.$Shape;
        static create(properties?: types.Asset.$Properties): types.Asset;

        /**
         * Encodes the specified Asset message. Does not implicitly {@link types.Asset.verify|verify} messages.
         * @param message Asset message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Asset.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Asset message, length delimited. Does not implicitly {@link types.Asset.verify|verify} messages.
         * @param message Asset message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Asset.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Asset message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Asset & types.Asset.$Shape} Asset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Asset & types.Asset.$Shape;

        /**
         * Decodes an Asset message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Asset & types.Asset.$Shape} Asset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Asset & types.Asset.$Shape;

        /**
         * Verifies an Asset message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Asset message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Asset
         */
        static fromObject(object: { [k: string]: any }): types.Asset;

        /**
         * Creates a plain object from an Asset message. Also converts values to other types if specified.
         * @param message Asset
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Asset, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Asset to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Asset
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Asset {

        /** Properties of an Asset. */
        interface $Properties {

            /** Asset id */
            id?: (number|Long|null);

            /** Asset symbol */
            symbol?: (string|null);

            /** Asset class */
            "class"?: (types.AssetClass|null);

            /** Asset issuer */
            issuer?: (Uint8Array|null);

            /** Asset gatePolicy */
            gatePolicy?: (types.GatePolicy|null);

            /** Asset tier */
            tier?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an Asset. */
        type $Shape = types.Asset.$Properties;
    }

    /**
     * Properties of a MessageRegisterAsset.
     * @deprecated Use types.MessageRegisterAsset.$Properties instead.
     */
    interface IMessageRegisterAsset extends types.MessageRegisterAsset.$Properties {
    }

    /** Represents a MessageRegisterAsset. */
    class MessageRegisterAsset {

        /**
         * Constructs a new MessageRegisterAsset.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageRegisterAsset.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageRegisterAsset symbol. */
        symbol: string;

        /** MessageRegisterAsset class. */
        class: types.AssetClass;

        /** MessageRegisterAsset issuer. */
        issuer: Uint8Array;

        /** MessageRegisterAsset gatePolicy. */
        gatePolicy: types.GatePolicy;

        /** MessageRegisterAsset tier. */
        tier: number;

        /**
         * Creates a new MessageRegisterAsset instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageRegisterAsset instance
         */
        static create(properties: types.MessageRegisterAsset.$Shape): types.MessageRegisterAsset & types.MessageRegisterAsset.$Shape;
        static create(properties?: types.MessageRegisterAsset.$Properties): types.MessageRegisterAsset;

        /**
         * Encodes the specified MessageRegisterAsset message. Does not implicitly {@link types.MessageRegisterAsset.verify|verify} messages.
         * @param message MessageRegisterAsset message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageRegisterAsset.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageRegisterAsset message, length delimited. Does not implicitly {@link types.MessageRegisterAsset.verify|verify} messages.
         * @param message MessageRegisterAsset message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageRegisterAsset.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageRegisterAsset message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageRegisterAsset & types.MessageRegisterAsset.$Shape} MessageRegisterAsset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageRegisterAsset & types.MessageRegisterAsset.$Shape;

        /**
         * Decodes a MessageRegisterAsset message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageRegisterAsset & types.MessageRegisterAsset.$Shape} MessageRegisterAsset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageRegisterAsset & types.MessageRegisterAsset.$Shape;

        /**
         * Verifies a MessageRegisterAsset message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageRegisterAsset message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageRegisterAsset
         */
        static fromObject(object: { [k: string]: any }): types.MessageRegisterAsset;

        /**
         * Creates a plain object from a MessageRegisterAsset message. Also converts values to other types if specified.
         * @param message MessageRegisterAsset
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageRegisterAsset, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageRegisterAsset to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageRegisterAsset
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageRegisterAsset {

        /** Properties of a MessageRegisterAsset. */
        interface $Properties {

            /** MessageRegisterAsset symbol */
            symbol?: (string|null);

            /** MessageRegisterAsset class */
            "class"?: (types.AssetClass|null);

            /** MessageRegisterAsset issuer */
            issuer?: (Uint8Array|null);

            /** MessageRegisterAsset gatePolicy */
            gatePolicy?: (types.GatePolicy|null);

            /** MessageRegisterAsset tier */
            tier?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageRegisterAsset. */
        type $Shape = types.MessageRegisterAsset.$Properties;
    }

    /**
     * Properties of a MessageSetGate.
     * @deprecated Use types.MessageSetGate.$Properties instead.
     */
    interface IMessageSetGate extends types.MessageSetGate.$Properties {
    }

    /** Represents a MessageSetGate. */
    class MessageSetGate {

        /**
         * Constructs a new MessageSetGate.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageSetGate.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageSetGate assetId. */
        assetId: (number|Long);

        /** MessageSetGate address. */
        address: Uint8Array;

        /** MessageSetGate allowed. */
        allowed: boolean;

        /**
         * Creates a new MessageSetGate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageSetGate instance
         */
        static create(properties: types.MessageSetGate.$Shape): types.MessageSetGate & types.MessageSetGate.$Shape;
        static create(properties?: types.MessageSetGate.$Properties): types.MessageSetGate;

        /**
         * Encodes the specified MessageSetGate message. Does not implicitly {@link types.MessageSetGate.verify|verify} messages.
         * @param message MessageSetGate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageSetGate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageSetGate message, length delimited. Does not implicitly {@link types.MessageSetGate.verify|verify} messages.
         * @param message MessageSetGate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageSetGate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageSetGate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageSetGate & types.MessageSetGate.$Shape} MessageSetGate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageSetGate & types.MessageSetGate.$Shape;

        /**
         * Decodes a MessageSetGate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageSetGate & types.MessageSetGate.$Shape} MessageSetGate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageSetGate & types.MessageSetGate.$Shape;

        /**
         * Verifies a MessageSetGate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageSetGate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageSetGate
         */
        static fromObject(object: { [k: string]: any }): types.MessageSetGate;

        /**
         * Creates a plain object from a MessageSetGate message. Also converts values to other types if specified.
         * @param message MessageSetGate
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageSetGate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageSetGate to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageSetGate
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageSetGate {

        /** Properties of a MessageSetGate. */
        interface $Properties {

            /** MessageSetGate assetId */
            assetId?: (number|Long|null);

            /** MessageSetGate address */
            address?: (Uint8Array|null);

            /** MessageSetGate allowed */
            allowed?: (boolean|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageSetGate. */
        type $Shape = types.MessageSetGate.$Properties;
    }

    /**
     * Properties of a RegistryMeta.
     * @deprecated Use types.RegistryMeta.$Properties instead.
     */
    interface IRegistryMeta extends types.RegistryMeta.$Properties {
    }

    /** Represents a RegistryMeta. */
    class RegistryMeta {

        /**
         * Constructs a new RegistryMeta.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.RegistryMeta.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** RegistryMeta assetCount. */
        assetCount: (number|Long);

        /**
         * Creates a new RegistryMeta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RegistryMeta instance
         */
        static create(properties: types.RegistryMeta.$Shape): types.RegistryMeta & types.RegistryMeta.$Shape;
        static create(properties?: types.RegistryMeta.$Properties): types.RegistryMeta;

        /**
         * Encodes the specified RegistryMeta message. Does not implicitly {@link types.RegistryMeta.verify|verify} messages.
         * @param message RegistryMeta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.RegistryMeta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RegistryMeta message, length delimited. Does not implicitly {@link types.RegistryMeta.verify|verify} messages.
         * @param message RegistryMeta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.RegistryMeta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RegistryMeta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.RegistryMeta & types.RegistryMeta.$Shape} RegistryMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.RegistryMeta & types.RegistryMeta.$Shape;

        /**
         * Decodes a RegistryMeta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.RegistryMeta & types.RegistryMeta.$Shape} RegistryMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.RegistryMeta & types.RegistryMeta.$Shape;

        /**
         * Verifies a RegistryMeta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RegistryMeta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RegistryMeta
         */
        static fromObject(object: { [k: string]: any }): types.RegistryMeta;

        /**
         * Creates a plain object from a RegistryMeta message. Also converts values to other types if specified.
         * @param message RegistryMeta
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.RegistryMeta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RegistryMeta to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for RegistryMeta
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace RegistryMeta {

        /** Properties of a RegistryMeta. */
        interface $Properties {

            /** RegistryMeta assetCount */
            assetCount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a RegistryMeta. */
        type $Shape = types.RegistryMeta.$Properties;
    }

    /**
     * Properties of an AdminConfig.
     * @deprecated Use types.AdminConfig.$Properties instead.
     */
    interface IAdminConfig extends types.AdminConfig.$Properties {
    }

    /** Represents an AdminConfig. */
    class AdminConfig {

        /**
         * Constructs a new AdminConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.AdminConfig.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** AdminConfig admin. */
        admin: Uint8Array;

        /**
         * Creates a new AdminConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AdminConfig instance
         */
        static create(properties: types.AdminConfig.$Shape): types.AdminConfig & types.AdminConfig.$Shape;
        static create(properties?: types.AdminConfig.$Properties): types.AdminConfig;

        /**
         * Encodes the specified AdminConfig message. Does not implicitly {@link types.AdminConfig.verify|verify} messages.
         * @param message AdminConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.AdminConfig.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AdminConfig message, length delimited. Does not implicitly {@link types.AdminConfig.verify|verify} messages.
         * @param message AdminConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.AdminConfig.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AdminConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.AdminConfig & types.AdminConfig.$Shape} AdminConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.AdminConfig & types.AdminConfig.$Shape;

        /**
         * Decodes an AdminConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.AdminConfig & types.AdminConfig.$Shape} AdminConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.AdminConfig & types.AdminConfig.$Shape;

        /**
         * Verifies an AdminConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AdminConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AdminConfig
         */
        static fromObject(object: { [k: string]: any }): types.AdminConfig;

        /**
         * Creates a plain object from an AdminConfig message. Also converts values to other types if specified.
         * @param message AdminConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.AdminConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AdminConfig to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for AdminConfig
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace AdminConfig {

        /** Properties of an AdminConfig. */
        interface $Properties {

            /** AdminConfig admin */
            admin?: (Uint8Array|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an AdminConfig. */
        type $Shape = types.AdminConfig.$Properties;
    }

    /**
     * Properties of an EventAssetRegistered.
     * @deprecated Use types.EventAssetRegistered.$Properties instead.
     */
    interface IEventAssetRegistered extends types.EventAssetRegistered.$Properties {
    }

    /** Represents an EventAssetRegistered. */
    class EventAssetRegistered {

        /**
         * Constructs a new EventAssetRegistered.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventAssetRegistered.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventAssetRegistered assetId. */
        assetId: (number|Long);

        /** EventAssetRegistered symbol. */
        symbol: string;

        /** EventAssetRegistered class. */
        class: types.AssetClass;

        /** EventAssetRegistered issuer. */
        issuer: Uint8Array;

        /** EventAssetRegistered gatePolicy. */
        gatePolicy: types.GatePolicy;

        /** EventAssetRegistered tier. */
        tier: number;

        /**
         * Creates a new EventAssetRegistered instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventAssetRegistered instance
         */
        static create(properties: types.EventAssetRegistered.$Shape): types.EventAssetRegistered & types.EventAssetRegistered.$Shape;
        static create(properties?: types.EventAssetRegistered.$Properties): types.EventAssetRegistered;

        /**
         * Encodes the specified EventAssetRegistered message. Does not implicitly {@link types.EventAssetRegistered.verify|verify} messages.
         * @param message EventAssetRegistered message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventAssetRegistered.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventAssetRegistered message, length delimited. Does not implicitly {@link types.EventAssetRegistered.verify|verify} messages.
         * @param message EventAssetRegistered message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventAssetRegistered.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventAssetRegistered message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventAssetRegistered & types.EventAssetRegistered.$Shape} EventAssetRegistered
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventAssetRegistered & types.EventAssetRegistered.$Shape;

        /**
         * Decodes an EventAssetRegistered message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventAssetRegistered & types.EventAssetRegistered.$Shape} EventAssetRegistered
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventAssetRegistered & types.EventAssetRegistered.$Shape;

        /**
         * Verifies an EventAssetRegistered message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventAssetRegistered message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventAssetRegistered
         */
        static fromObject(object: { [k: string]: any }): types.EventAssetRegistered;

        /**
         * Creates a plain object from an EventAssetRegistered message. Also converts values to other types if specified.
         * @param message EventAssetRegistered
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventAssetRegistered, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventAssetRegistered to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventAssetRegistered
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventAssetRegistered {

        /** Properties of an EventAssetRegistered. */
        interface $Properties {

            /** EventAssetRegistered assetId */
            assetId?: (number|Long|null);

            /** EventAssetRegistered symbol */
            symbol?: (string|null);

            /** EventAssetRegistered class */
            "class"?: (types.AssetClass|null);

            /** EventAssetRegistered issuer */
            issuer?: (Uint8Array|null);

            /** EventAssetRegistered gatePolicy */
            gatePolicy?: (types.GatePolicy|null);

            /** EventAssetRegistered tier */
            tier?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventAssetRegistered. */
        type $Shape = types.EventAssetRegistered.$Properties;
    }

    /**
     * Properties of an EventGateSet.
     * @deprecated Use types.EventGateSet.$Properties instead.
     */
    interface IEventGateSet extends types.EventGateSet.$Properties {
    }

    /** Represents an EventGateSet. */
    class EventGateSet {

        /**
         * Constructs a new EventGateSet.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventGateSet.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventGateSet assetId. */
        assetId: (number|Long);

        /** EventGateSet address. */
        address: Uint8Array;

        /** EventGateSet allowed. */
        allowed: boolean;

        /**
         * Creates a new EventGateSet instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventGateSet instance
         */
        static create(properties: types.EventGateSet.$Shape): types.EventGateSet & types.EventGateSet.$Shape;
        static create(properties?: types.EventGateSet.$Properties): types.EventGateSet;

        /**
         * Encodes the specified EventGateSet message. Does not implicitly {@link types.EventGateSet.verify|verify} messages.
         * @param message EventGateSet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventGateSet.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventGateSet message, length delimited. Does not implicitly {@link types.EventGateSet.verify|verify} messages.
         * @param message EventGateSet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventGateSet.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventGateSet message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventGateSet & types.EventGateSet.$Shape} EventGateSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventGateSet & types.EventGateSet.$Shape;

        /**
         * Decodes an EventGateSet message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventGateSet & types.EventGateSet.$Shape} EventGateSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventGateSet & types.EventGateSet.$Shape;

        /**
         * Verifies an EventGateSet message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventGateSet message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventGateSet
         */
        static fromObject(object: { [k: string]: any }): types.EventGateSet;

        /**
         * Creates a plain object from an EventGateSet message. Also converts values to other types if specified.
         * @param message EventGateSet
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventGateSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventGateSet to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventGateSet
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventGateSet {

        /** Properties of an EventGateSet. */
        interface $Properties {

            /** EventGateSet assetId */
            assetId?: (number|Long|null);

            /** EventGateSet address */
            address?: (Uint8Array|null);

            /** EventGateSet allowed */
            allowed?: (boolean|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventGateSet. */
        type $Shape = types.EventGateSet.$Properties;
    }

    /**
     * Properties of a CUSDParams.
     * @deprecated Use types.CUSDParams.$Properties instead.
     */
    interface ICUSDParams extends types.CUSDParams.$Properties {
    }

    /** Represents a CUSDParams. */
    class CUSDParams {

        /**
         * Constructs a new CUSDParams.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.CUSDParams.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** CUSDParams supplyCap. */
        supplyCap: (number|Long);

        /** CUSDParams minCollateralBps. */
        minCollateralBps: number;

        /** CUSDParams liquidationBps. */
        liquidationBps: number;

        /** CUSDParams liquidationPenaltyBps. */
        liquidationPenaltyBps: number;

        /** CUSDParams maxPriceAge. */
        maxPriceAge: (number|Long);

        /** CUSDParams maxPriceMoveBps. */
        maxPriceMoveBps: number;

        /**
         * Creates a new CUSDParams instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CUSDParams instance
         */
        static create(properties: types.CUSDParams.$Shape): types.CUSDParams & types.CUSDParams.$Shape;
        static create(properties?: types.CUSDParams.$Properties): types.CUSDParams;

        /**
         * Encodes the specified CUSDParams message. Does not implicitly {@link types.CUSDParams.verify|verify} messages.
         * @param message CUSDParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.CUSDParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CUSDParams message, length delimited. Does not implicitly {@link types.CUSDParams.verify|verify} messages.
         * @param message CUSDParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.CUSDParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CUSDParams message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.CUSDParams & types.CUSDParams.$Shape} CUSDParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.CUSDParams & types.CUSDParams.$Shape;

        /**
         * Decodes a CUSDParams message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.CUSDParams & types.CUSDParams.$Shape} CUSDParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.CUSDParams & types.CUSDParams.$Shape;

        /**
         * Verifies a CUSDParams message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CUSDParams message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CUSDParams
         */
        static fromObject(object: { [k: string]: any }): types.CUSDParams;

        /**
         * Creates a plain object from a CUSDParams message. Also converts values to other types if specified.
         * @param message CUSDParams
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.CUSDParams, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CUSDParams to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for CUSDParams
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace CUSDParams {

        /** Properties of a CUSDParams. */
        interface $Properties {

            /** CUSDParams supplyCap */
            supplyCap?: (number|Long|null);

            /** CUSDParams minCollateralBps */
            minCollateralBps?: (number|null);

            /** CUSDParams liquidationBps */
            liquidationBps?: (number|null);

            /** CUSDParams liquidationPenaltyBps */
            liquidationPenaltyBps?: (number|null);

            /** CUSDParams maxPriceAge */
            maxPriceAge?: (number|Long|null);

            /** CUSDParams maxPriceMoveBps */
            maxPriceMoveBps?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a CUSDParams. */
        type $Shape = types.CUSDParams.$Properties;
    }

    /**
     * Properties of a PriceRecord.
     * @deprecated Use types.PriceRecord.$Properties instead.
     */
    interface IPriceRecord extends types.PriceRecord.$Properties {
    }

    /** Represents a PriceRecord. */
    class PriceRecord {

        /**
         * Constructs a new PriceRecord.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.PriceRecord.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** PriceRecord price. */
        price: (number|Long);

        /** PriceRecord height. */
        height: (number|Long);

        /**
         * Creates a new PriceRecord instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PriceRecord instance
         */
        static create(properties: types.PriceRecord.$Shape): types.PriceRecord & types.PriceRecord.$Shape;
        static create(properties?: types.PriceRecord.$Properties): types.PriceRecord;

        /**
         * Encodes the specified PriceRecord message. Does not implicitly {@link types.PriceRecord.verify|verify} messages.
         * @param message PriceRecord message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.PriceRecord.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PriceRecord message, length delimited. Does not implicitly {@link types.PriceRecord.verify|verify} messages.
         * @param message PriceRecord message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.PriceRecord.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PriceRecord message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.PriceRecord & types.PriceRecord.$Shape} PriceRecord
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.PriceRecord & types.PriceRecord.$Shape;

        /**
         * Decodes a PriceRecord message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.PriceRecord & types.PriceRecord.$Shape} PriceRecord
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.PriceRecord & types.PriceRecord.$Shape;

        /**
         * Verifies a PriceRecord message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PriceRecord message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PriceRecord
         */
        static fromObject(object: { [k: string]: any }): types.PriceRecord;

        /**
         * Creates a plain object from a PriceRecord message. Also converts values to other types if specified.
         * @param message PriceRecord
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.PriceRecord, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PriceRecord to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for PriceRecord
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace PriceRecord {

        /** Properties of a PriceRecord. */
        interface $Properties {

            /** PriceRecord price */
            price?: (number|Long|null);

            /** PriceRecord height */
            height?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a PriceRecord. */
        type $Shape = types.PriceRecord.$Properties;
    }

    /**
     * Properties of a CUSDSupply.
     * @deprecated Use types.CUSDSupply.$Properties instead.
     */
    interface ICUSDSupply extends types.CUSDSupply.$Properties {
    }

    /** Represents a CUSDSupply. */
    class CUSDSupply {

        /**
         * Constructs a new CUSDSupply.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.CUSDSupply.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** CUSDSupply totalDebt. */
        totalDebt: (number|Long);

        /**
         * Creates a new CUSDSupply instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CUSDSupply instance
         */
        static create(properties: types.CUSDSupply.$Shape): types.CUSDSupply & types.CUSDSupply.$Shape;
        static create(properties?: types.CUSDSupply.$Properties): types.CUSDSupply;

        /**
         * Encodes the specified CUSDSupply message. Does not implicitly {@link types.CUSDSupply.verify|verify} messages.
         * @param message CUSDSupply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.CUSDSupply.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CUSDSupply message, length delimited. Does not implicitly {@link types.CUSDSupply.verify|verify} messages.
         * @param message CUSDSupply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.CUSDSupply.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CUSDSupply message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.CUSDSupply & types.CUSDSupply.$Shape} CUSDSupply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.CUSDSupply & types.CUSDSupply.$Shape;

        /**
         * Decodes a CUSDSupply message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.CUSDSupply & types.CUSDSupply.$Shape} CUSDSupply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.CUSDSupply & types.CUSDSupply.$Shape;

        /**
         * Verifies a CUSDSupply message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CUSDSupply message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CUSDSupply
         */
        static fromObject(object: { [k: string]: any }): types.CUSDSupply;

        /**
         * Creates a plain object from a CUSDSupply message. Also converts values to other types if specified.
         * @param message CUSDSupply
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.CUSDSupply, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CUSDSupply to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for CUSDSupply
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace CUSDSupply {

        /** Properties of a CUSDSupply. */
        interface $Properties {

            /** CUSDSupply totalDebt */
            totalDebt?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a CUSDSupply. */
        type $Shape = types.CUSDSupply.$Properties;
    }

    /**
     * Properties of a CUSDAccount.
     * @deprecated Use types.CUSDAccount.$Properties instead.
     */
    interface ICUSDAccount extends types.CUSDAccount.$Properties {
    }

    /** Represents a CUSDAccount. */
    class CUSDAccount {

        /**
         * Constructs a new CUSDAccount.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.CUSDAccount.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** CUSDAccount amount. */
        amount: (number|Long);

        /**
         * Creates a new CUSDAccount instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CUSDAccount instance
         */
        static create(properties: types.CUSDAccount.$Shape): types.CUSDAccount & types.CUSDAccount.$Shape;
        static create(properties?: types.CUSDAccount.$Properties): types.CUSDAccount;

        /**
         * Encodes the specified CUSDAccount message. Does not implicitly {@link types.CUSDAccount.verify|verify} messages.
         * @param message CUSDAccount message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.CUSDAccount.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CUSDAccount message, length delimited. Does not implicitly {@link types.CUSDAccount.verify|verify} messages.
         * @param message CUSDAccount message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.CUSDAccount.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CUSDAccount message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.CUSDAccount & types.CUSDAccount.$Shape} CUSDAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.CUSDAccount & types.CUSDAccount.$Shape;

        /**
         * Decodes a CUSDAccount message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.CUSDAccount & types.CUSDAccount.$Shape} CUSDAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.CUSDAccount & types.CUSDAccount.$Shape;

        /**
         * Verifies a CUSDAccount message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CUSDAccount message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CUSDAccount
         */
        static fromObject(object: { [k: string]: any }): types.CUSDAccount;

        /**
         * Creates a plain object from a CUSDAccount message. Also converts values to other types if specified.
         * @param message CUSDAccount
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.CUSDAccount, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CUSDAccount to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for CUSDAccount
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace CUSDAccount {

        /** Properties of a CUSDAccount. */
        interface $Properties {

            /** CUSDAccount amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a CUSDAccount. */
        type $Shape = types.CUSDAccount.$Properties;
    }

    /**
     * Properties of a Vault.
     * @deprecated Use types.Vault.$Properties instead.
     */
    interface IVault extends types.Vault.$Properties {
    }

    /** Represents a Vault. */
    class Vault {

        /**
         * Constructs a new Vault.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Vault.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Vault collateral. */
        collateral: (number|Long);

        /** Vault debt. */
        debt: (number|Long);

        /**
         * Creates a new Vault instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Vault instance
         */
        static create(properties: types.Vault.$Shape): types.Vault & types.Vault.$Shape;
        static create(properties?: types.Vault.$Properties): types.Vault;

        /**
         * Encodes the specified Vault message. Does not implicitly {@link types.Vault.verify|verify} messages.
         * @param message Vault message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Vault.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Vault message, length delimited. Does not implicitly {@link types.Vault.verify|verify} messages.
         * @param message Vault message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Vault.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Vault message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Vault & types.Vault.$Shape} Vault
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Vault & types.Vault.$Shape;

        /**
         * Decodes a Vault message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Vault & types.Vault.$Shape} Vault
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Vault & types.Vault.$Shape;

        /**
         * Verifies a Vault message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Vault message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Vault
         */
        static fromObject(object: { [k: string]: any }): types.Vault;

        /**
         * Creates a plain object from a Vault message. Also converts values to other types if specified.
         * @param message Vault
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Vault, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Vault to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Vault
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Vault {

        /** Properties of a Vault. */
        interface $Properties {

            /** Vault collateral */
            collateral?: (number|Long|null);

            /** Vault debt */
            debt?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Vault. */
        type $Shape = types.Vault.$Properties;
    }

    /**
     * Properties of a MessageSetCUSDParams.
     * @deprecated Use types.MessageSetCUSDParams.$Properties instead.
     */
    interface IMessageSetCUSDParams extends types.MessageSetCUSDParams.$Properties {
    }

    /** Represents a MessageSetCUSDParams. */
    class MessageSetCUSDParams {

        /**
         * Constructs a new MessageSetCUSDParams.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageSetCUSDParams.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageSetCUSDParams params. */
        params?: (types.CUSDParams.$Properties|null);

        /**
         * Creates a new MessageSetCUSDParams instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageSetCUSDParams instance
         */
        static create(properties: types.MessageSetCUSDParams.$Shape): types.MessageSetCUSDParams & types.MessageSetCUSDParams.$Shape;
        static create(properties?: types.MessageSetCUSDParams.$Properties): types.MessageSetCUSDParams;

        /**
         * Encodes the specified MessageSetCUSDParams message. Does not implicitly {@link types.MessageSetCUSDParams.verify|verify} messages.
         * @param message MessageSetCUSDParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageSetCUSDParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageSetCUSDParams message, length delimited. Does not implicitly {@link types.MessageSetCUSDParams.verify|verify} messages.
         * @param message MessageSetCUSDParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageSetCUSDParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageSetCUSDParams message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageSetCUSDParams & types.MessageSetCUSDParams.$Shape} MessageSetCUSDParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageSetCUSDParams & types.MessageSetCUSDParams.$Shape;

        /**
         * Decodes a MessageSetCUSDParams message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageSetCUSDParams & types.MessageSetCUSDParams.$Shape} MessageSetCUSDParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageSetCUSDParams & types.MessageSetCUSDParams.$Shape;

        /**
         * Verifies a MessageSetCUSDParams message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageSetCUSDParams message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageSetCUSDParams
         */
        static fromObject(object: { [k: string]: any }): types.MessageSetCUSDParams;

        /**
         * Creates a plain object from a MessageSetCUSDParams message. Also converts values to other types if specified.
         * @param message MessageSetCUSDParams
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageSetCUSDParams, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageSetCUSDParams to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageSetCUSDParams
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageSetCUSDParams {

        /** Properties of a MessageSetCUSDParams. */
        interface $Properties {

            /** MessageSetCUSDParams params */
            params?: (types.CUSDParams.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageSetCUSDParams. */
        type $Shape = types.MessageSetCUSDParams.$Properties;
    }

    /**
     * Properties of a MessagePostPrice.
     * @deprecated Use types.MessagePostPrice.$Properties instead.
     */
    interface IMessagePostPrice extends types.MessagePostPrice.$Properties {
    }

    /** Represents a MessagePostPrice. */
    class MessagePostPrice {

        /**
         * Constructs a new MessagePostPrice.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessagePostPrice.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessagePostPrice price. */
        price: (number|Long);

        /**
         * Creates a new MessagePostPrice instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessagePostPrice instance
         */
        static create(properties: types.MessagePostPrice.$Shape): types.MessagePostPrice & types.MessagePostPrice.$Shape;
        static create(properties?: types.MessagePostPrice.$Properties): types.MessagePostPrice;

        /**
         * Encodes the specified MessagePostPrice message. Does not implicitly {@link types.MessagePostPrice.verify|verify} messages.
         * @param message MessagePostPrice message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessagePostPrice.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessagePostPrice message, length delimited. Does not implicitly {@link types.MessagePostPrice.verify|verify} messages.
         * @param message MessagePostPrice message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessagePostPrice.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessagePostPrice message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessagePostPrice & types.MessagePostPrice.$Shape} MessagePostPrice
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessagePostPrice & types.MessagePostPrice.$Shape;

        /**
         * Decodes a MessagePostPrice message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessagePostPrice & types.MessagePostPrice.$Shape} MessagePostPrice
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessagePostPrice & types.MessagePostPrice.$Shape;

        /**
         * Verifies a MessagePostPrice message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessagePostPrice message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessagePostPrice
         */
        static fromObject(object: { [k: string]: any }): types.MessagePostPrice;

        /**
         * Creates a plain object from a MessagePostPrice message. Also converts values to other types if specified.
         * @param message MessagePostPrice
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessagePostPrice, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessagePostPrice to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessagePostPrice
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessagePostPrice {

        /** Properties of a MessagePostPrice. */
        interface $Properties {

            /** MessagePostPrice price */
            price?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessagePostPrice. */
        type $Shape = types.MessagePostPrice.$Properties;
    }

    /**
     * Properties of a MessageVaultDeposit.
     * @deprecated Use types.MessageVaultDeposit.$Properties instead.
     */
    interface IMessageVaultDeposit extends types.MessageVaultDeposit.$Properties {
    }

    /** Represents a MessageVaultDeposit. */
    class MessageVaultDeposit {

        /**
         * Constructs a new MessageVaultDeposit.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageVaultDeposit.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageVaultDeposit fromAddress. */
        fromAddress: Uint8Array;

        /** MessageVaultDeposit amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageVaultDeposit instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageVaultDeposit instance
         */
        static create(properties: types.MessageVaultDeposit.$Shape): types.MessageVaultDeposit & types.MessageVaultDeposit.$Shape;
        static create(properties?: types.MessageVaultDeposit.$Properties): types.MessageVaultDeposit;

        /**
         * Encodes the specified MessageVaultDeposit message. Does not implicitly {@link types.MessageVaultDeposit.verify|verify} messages.
         * @param message MessageVaultDeposit message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageVaultDeposit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageVaultDeposit message, length delimited. Does not implicitly {@link types.MessageVaultDeposit.verify|verify} messages.
         * @param message MessageVaultDeposit message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageVaultDeposit.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageVaultDeposit message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageVaultDeposit & types.MessageVaultDeposit.$Shape} MessageVaultDeposit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageVaultDeposit & types.MessageVaultDeposit.$Shape;

        /**
         * Decodes a MessageVaultDeposit message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageVaultDeposit & types.MessageVaultDeposit.$Shape} MessageVaultDeposit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageVaultDeposit & types.MessageVaultDeposit.$Shape;

        /**
         * Verifies a MessageVaultDeposit message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageVaultDeposit message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageVaultDeposit
         */
        static fromObject(object: { [k: string]: any }): types.MessageVaultDeposit;

        /**
         * Creates a plain object from a MessageVaultDeposit message. Also converts values to other types if specified.
         * @param message MessageVaultDeposit
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageVaultDeposit, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageVaultDeposit to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageVaultDeposit
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageVaultDeposit {

        /** Properties of a MessageVaultDeposit. */
        interface $Properties {

            /** MessageVaultDeposit fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageVaultDeposit amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageVaultDeposit. */
        type $Shape = types.MessageVaultDeposit.$Properties;
    }

    /**
     * Properties of a MessageVaultWithdraw.
     * @deprecated Use types.MessageVaultWithdraw.$Properties instead.
     */
    interface IMessageVaultWithdraw extends types.MessageVaultWithdraw.$Properties {
    }

    /** Represents a MessageVaultWithdraw. */
    class MessageVaultWithdraw {

        /**
         * Constructs a new MessageVaultWithdraw.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageVaultWithdraw.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageVaultWithdraw fromAddress. */
        fromAddress: Uint8Array;

        /** MessageVaultWithdraw amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageVaultWithdraw instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageVaultWithdraw instance
         */
        static create(properties: types.MessageVaultWithdraw.$Shape): types.MessageVaultWithdraw & types.MessageVaultWithdraw.$Shape;
        static create(properties?: types.MessageVaultWithdraw.$Properties): types.MessageVaultWithdraw;

        /**
         * Encodes the specified MessageVaultWithdraw message. Does not implicitly {@link types.MessageVaultWithdraw.verify|verify} messages.
         * @param message MessageVaultWithdraw message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageVaultWithdraw.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageVaultWithdraw message, length delimited. Does not implicitly {@link types.MessageVaultWithdraw.verify|verify} messages.
         * @param message MessageVaultWithdraw message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageVaultWithdraw.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageVaultWithdraw message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageVaultWithdraw & types.MessageVaultWithdraw.$Shape} MessageVaultWithdraw
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageVaultWithdraw & types.MessageVaultWithdraw.$Shape;

        /**
         * Decodes a MessageVaultWithdraw message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageVaultWithdraw & types.MessageVaultWithdraw.$Shape} MessageVaultWithdraw
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageVaultWithdraw & types.MessageVaultWithdraw.$Shape;

        /**
         * Verifies a MessageVaultWithdraw message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageVaultWithdraw message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageVaultWithdraw
         */
        static fromObject(object: { [k: string]: any }): types.MessageVaultWithdraw;

        /**
         * Creates a plain object from a MessageVaultWithdraw message. Also converts values to other types if specified.
         * @param message MessageVaultWithdraw
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageVaultWithdraw, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageVaultWithdraw to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageVaultWithdraw
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageVaultWithdraw {

        /** Properties of a MessageVaultWithdraw. */
        interface $Properties {

            /** MessageVaultWithdraw fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageVaultWithdraw amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageVaultWithdraw. */
        type $Shape = types.MessageVaultWithdraw.$Properties;
    }

    /**
     * Properties of a MessageCUSDMint.
     * @deprecated Use types.MessageCUSDMint.$Properties instead.
     */
    interface IMessageCUSDMint extends types.MessageCUSDMint.$Properties {
    }

    /** Represents a MessageCUSDMint. */
    class MessageCUSDMint {

        /**
         * Constructs a new MessageCUSDMint.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageCUSDMint.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageCUSDMint fromAddress. */
        fromAddress: Uint8Array;

        /** MessageCUSDMint amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageCUSDMint instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageCUSDMint instance
         */
        static create(properties: types.MessageCUSDMint.$Shape): types.MessageCUSDMint & types.MessageCUSDMint.$Shape;
        static create(properties?: types.MessageCUSDMint.$Properties): types.MessageCUSDMint;

        /**
         * Encodes the specified MessageCUSDMint message. Does not implicitly {@link types.MessageCUSDMint.verify|verify} messages.
         * @param message MessageCUSDMint message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageCUSDMint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageCUSDMint message, length delimited. Does not implicitly {@link types.MessageCUSDMint.verify|verify} messages.
         * @param message MessageCUSDMint message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageCUSDMint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageCUSDMint message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageCUSDMint & types.MessageCUSDMint.$Shape} MessageCUSDMint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageCUSDMint & types.MessageCUSDMint.$Shape;

        /**
         * Decodes a MessageCUSDMint message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageCUSDMint & types.MessageCUSDMint.$Shape} MessageCUSDMint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageCUSDMint & types.MessageCUSDMint.$Shape;

        /**
         * Verifies a MessageCUSDMint message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageCUSDMint message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageCUSDMint
         */
        static fromObject(object: { [k: string]: any }): types.MessageCUSDMint;

        /**
         * Creates a plain object from a MessageCUSDMint message. Also converts values to other types if specified.
         * @param message MessageCUSDMint
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageCUSDMint, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageCUSDMint to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageCUSDMint
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageCUSDMint {

        /** Properties of a MessageCUSDMint. */
        interface $Properties {

            /** MessageCUSDMint fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageCUSDMint amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageCUSDMint. */
        type $Shape = types.MessageCUSDMint.$Properties;
    }

    /**
     * Properties of a MessageCUSDBurn.
     * @deprecated Use types.MessageCUSDBurn.$Properties instead.
     */
    interface IMessageCUSDBurn extends types.MessageCUSDBurn.$Properties {
    }

    /** Represents a MessageCUSDBurn. */
    class MessageCUSDBurn {

        /**
         * Constructs a new MessageCUSDBurn.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageCUSDBurn.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageCUSDBurn fromAddress. */
        fromAddress: Uint8Array;

        /** MessageCUSDBurn amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageCUSDBurn instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageCUSDBurn instance
         */
        static create(properties: types.MessageCUSDBurn.$Shape): types.MessageCUSDBurn & types.MessageCUSDBurn.$Shape;
        static create(properties?: types.MessageCUSDBurn.$Properties): types.MessageCUSDBurn;

        /**
         * Encodes the specified MessageCUSDBurn message. Does not implicitly {@link types.MessageCUSDBurn.verify|verify} messages.
         * @param message MessageCUSDBurn message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageCUSDBurn.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageCUSDBurn message, length delimited. Does not implicitly {@link types.MessageCUSDBurn.verify|verify} messages.
         * @param message MessageCUSDBurn message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageCUSDBurn.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageCUSDBurn message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageCUSDBurn & types.MessageCUSDBurn.$Shape} MessageCUSDBurn
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageCUSDBurn & types.MessageCUSDBurn.$Shape;

        /**
         * Decodes a MessageCUSDBurn message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageCUSDBurn & types.MessageCUSDBurn.$Shape} MessageCUSDBurn
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageCUSDBurn & types.MessageCUSDBurn.$Shape;

        /**
         * Verifies a MessageCUSDBurn message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageCUSDBurn message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageCUSDBurn
         */
        static fromObject(object: { [k: string]: any }): types.MessageCUSDBurn;

        /**
         * Creates a plain object from a MessageCUSDBurn message. Also converts values to other types if specified.
         * @param message MessageCUSDBurn
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageCUSDBurn, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageCUSDBurn to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageCUSDBurn
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageCUSDBurn {

        /** Properties of a MessageCUSDBurn. */
        interface $Properties {

            /** MessageCUSDBurn fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageCUSDBurn amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageCUSDBurn. */
        type $Shape = types.MessageCUSDBurn.$Properties;
    }

    /**
     * Properties of a MessageCUSDTransfer.
     * @deprecated Use types.MessageCUSDTransfer.$Properties instead.
     */
    interface IMessageCUSDTransfer extends types.MessageCUSDTransfer.$Properties {
    }

    /** Represents a MessageCUSDTransfer. */
    class MessageCUSDTransfer {

        /**
         * Constructs a new MessageCUSDTransfer.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageCUSDTransfer.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageCUSDTransfer fromAddress. */
        fromAddress: Uint8Array;

        /** MessageCUSDTransfer toAddress. */
        toAddress: Uint8Array;

        /** MessageCUSDTransfer amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageCUSDTransfer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageCUSDTransfer instance
         */
        static create(properties: types.MessageCUSDTransfer.$Shape): types.MessageCUSDTransfer & types.MessageCUSDTransfer.$Shape;
        static create(properties?: types.MessageCUSDTransfer.$Properties): types.MessageCUSDTransfer;

        /**
         * Encodes the specified MessageCUSDTransfer message. Does not implicitly {@link types.MessageCUSDTransfer.verify|verify} messages.
         * @param message MessageCUSDTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageCUSDTransfer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageCUSDTransfer message, length delimited. Does not implicitly {@link types.MessageCUSDTransfer.verify|verify} messages.
         * @param message MessageCUSDTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageCUSDTransfer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageCUSDTransfer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageCUSDTransfer & types.MessageCUSDTransfer.$Shape} MessageCUSDTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageCUSDTransfer & types.MessageCUSDTransfer.$Shape;

        /**
         * Decodes a MessageCUSDTransfer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageCUSDTransfer & types.MessageCUSDTransfer.$Shape} MessageCUSDTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageCUSDTransfer & types.MessageCUSDTransfer.$Shape;

        /**
         * Verifies a MessageCUSDTransfer message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageCUSDTransfer message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageCUSDTransfer
         */
        static fromObject(object: { [k: string]: any }): types.MessageCUSDTransfer;

        /**
         * Creates a plain object from a MessageCUSDTransfer message. Also converts values to other types if specified.
         * @param message MessageCUSDTransfer
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageCUSDTransfer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageCUSDTransfer to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageCUSDTransfer
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageCUSDTransfer {

        /** Properties of a MessageCUSDTransfer. */
        interface $Properties {

            /** MessageCUSDTransfer fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageCUSDTransfer toAddress */
            toAddress?: (Uint8Array|null);

            /** MessageCUSDTransfer amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageCUSDTransfer. */
        type $Shape = types.MessageCUSDTransfer.$Properties;
    }

    /**
     * Properties of a MessageLiquidate.
     * @deprecated Use types.MessageLiquidate.$Properties instead.
     */
    interface IMessageLiquidate extends types.MessageLiquidate.$Properties {
    }

    /** Represents a MessageLiquidate. */
    class MessageLiquidate {

        /**
         * Constructs a new MessageLiquidate.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageLiquidate.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageLiquidate fromAddress. */
        fromAddress: Uint8Array;

        /** MessageLiquidate vaultOwner. */
        vaultOwner: Uint8Array;

        /** MessageLiquidate repayAmount. */
        repayAmount: (number|Long);

        /**
         * Creates a new MessageLiquidate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageLiquidate instance
         */
        static create(properties: types.MessageLiquidate.$Shape): types.MessageLiquidate & types.MessageLiquidate.$Shape;
        static create(properties?: types.MessageLiquidate.$Properties): types.MessageLiquidate;

        /**
         * Encodes the specified MessageLiquidate message. Does not implicitly {@link types.MessageLiquidate.verify|verify} messages.
         * @param message MessageLiquidate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageLiquidate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageLiquidate message, length delimited. Does not implicitly {@link types.MessageLiquidate.verify|verify} messages.
         * @param message MessageLiquidate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageLiquidate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageLiquidate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageLiquidate & types.MessageLiquidate.$Shape} MessageLiquidate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageLiquidate & types.MessageLiquidate.$Shape;

        /**
         * Decodes a MessageLiquidate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageLiquidate & types.MessageLiquidate.$Shape} MessageLiquidate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageLiquidate & types.MessageLiquidate.$Shape;

        /**
         * Verifies a MessageLiquidate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageLiquidate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageLiquidate
         */
        static fromObject(object: { [k: string]: any }): types.MessageLiquidate;

        /**
         * Creates a plain object from a MessageLiquidate message. Also converts values to other types if specified.
         * @param message MessageLiquidate
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageLiquidate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageLiquidate to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageLiquidate
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageLiquidate {

        /** Properties of a MessageLiquidate. */
        interface $Properties {

            /** MessageLiquidate fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageLiquidate vaultOwner */
            vaultOwner?: (Uint8Array|null);

            /** MessageLiquidate repayAmount */
            repayAmount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageLiquidate. */
        type $Shape = types.MessageLiquidate.$Properties;
    }

    /**
     * Properties of an EventPricePosted.
     * @deprecated Use types.EventPricePosted.$Properties instead.
     */
    interface IEventPricePosted extends types.EventPricePosted.$Properties {
    }

    /** Represents an EventPricePosted. */
    class EventPricePosted {

        /**
         * Constructs a new EventPricePosted.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventPricePosted.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventPricePosted price. */
        price: (number|Long);

        /** EventPricePosted height. */
        height: (number|Long);

        /**
         * Creates a new EventPricePosted instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventPricePosted instance
         */
        static create(properties: types.EventPricePosted.$Shape): types.EventPricePosted & types.EventPricePosted.$Shape;
        static create(properties?: types.EventPricePosted.$Properties): types.EventPricePosted;

        /**
         * Encodes the specified EventPricePosted message. Does not implicitly {@link types.EventPricePosted.verify|verify} messages.
         * @param message EventPricePosted message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventPricePosted.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventPricePosted message, length delimited. Does not implicitly {@link types.EventPricePosted.verify|verify} messages.
         * @param message EventPricePosted message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventPricePosted.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventPricePosted message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventPricePosted & types.EventPricePosted.$Shape} EventPricePosted
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventPricePosted & types.EventPricePosted.$Shape;

        /**
         * Decodes an EventPricePosted message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventPricePosted & types.EventPricePosted.$Shape} EventPricePosted
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventPricePosted & types.EventPricePosted.$Shape;

        /**
         * Verifies an EventPricePosted message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventPricePosted message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventPricePosted
         */
        static fromObject(object: { [k: string]: any }): types.EventPricePosted;

        /**
         * Creates a plain object from an EventPricePosted message. Also converts values to other types if specified.
         * @param message EventPricePosted
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventPricePosted, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventPricePosted to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventPricePosted
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventPricePosted {

        /** Properties of an EventPricePosted. */
        interface $Properties {

            /** EventPricePosted price */
            price?: (number|Long|null);

            /** EventPricePosted height */
            height?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventPricePosted. */
        type $Shape = types.EventPricePosted.$Properties;
    }

    /**
     * Properties of an EventVaultUpdated.
     * @deprecated Use types.EventVaultUpdated.$Properties instead.
     */
    interface IEventVaultUpdated extends types.EventVaultUpdated.$Properties {
    }

    /** Represents an EventVaultUpdated. */
    class EventVaultUpdated {

        /**
         * Constructs a new EventVaultUpdated.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventVaultUpdated.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventVaultUpdated action. */
        action: string;

        /** EventVaultUpdated owner. */
        owner: Uint8Array;

        /** EventVaultUpdated amount. */
        amount: (number|Long);

        /** EventVaultUpdated collateral. */
        collateral: (number|Long);

        /** EventVaultUpdated debt. */
        debt: (number|Long);

        /**
         * Creates a new EventVaultUpdated instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventVaultUpdated instance
         */
        static create(properties: types.EventVaultUpdated.$Shape): types.EventVaultUpdated & types.EventVaultUpdated.$Shape;
        static create(properties?: types.EventVaultUpdated.$Properties): types.EventVaultUpdated;

        /**
         * Encodes the specified EventVaultUpdated message. Does not implicitly {@link types.EventVaultUpdated.verify|verify} messages.
         * @param message EventVaultUpdated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventVaultUpdated.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventVaultUpdated message, length delimited. Does not implicitly {@link types.EventVaultUpdated.verify|verify} messages.
         * @param message EventVaultUpdated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventVaultUpdated.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventVaultUpdated message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventVaultUpdated & types.EventVaultUpdated.$Shape} EventVaultUpdated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventVaultUpdated & types.EventVaultUpdated.$Shape;

        /**
         * Decodes an EventVaultUpdated message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventVaultUpdated & types.EventVaultUpdated.$Shape} EventVaultUpdated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventVaultUpdated & types.EventVaultUpdated.$Shape;

        /**
         * Verifies an EventVaultUpdated message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventVaultUpdated message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventVaultUpdated
         */
        static fromObject(object: { [k: string]: any }): types.EventVaultUpdated;

        /**
         * Creates a plain object from an EventVaultUpdated message. Also converts values to other types if specified.
         * @param message EventVaultUpdated
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventVaultUpdated, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventVaultUpdated to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventVaultUpdated
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventVaultUpdated {

        /** Properties of an EventVaultUpdated. */
        interface $Properties {

            /** EventVaultUpdated action */
            action?: (string|null);

            /** EventVaultUpdated owner */
            owner?: (Uint8Array|null);

            /** EventVaultUpdated amount */
            amount?: (number|Long|null);

            /** EventVaultUpdated collateral */
            collateral?: (number|Long|null);

            /** EventVaultUpdated debt */
            debt?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventVaultUpdated. */
        type $Shape = types.EventVaultUpdated.$Properties;
    }

    /**
     * Properties of an EventCUSDTransfer.
     * @deprecated Use types.EventCUSDTransfer.$Properties instead.
     */
    interface IEventCUSDTransfer extends types.EventCUSDTransfer.$Properties {
    }

    /** Represents an EventCUSDTransfer. */
    class EventCUSDTransfer {

        /**
         * Constructs a new EventCUSDTransfer.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventCUSDTransfer.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventCUSDTransfer fromAddress. */
        fromAddress: Uint8Array;

        /** EventCUSDTransfer toAddress. */
        toAddress: Uint8Array;

        /** EventCUSDTransfer amount. */
        amount: (number|Long);

        /**
         * Creates a new EventCUSDTransfer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventCUSDTransfer instance
         */
        static create(properties: types.EventCUSDTransfer.$Shape): types.EventCUSDTransfer & types.EventCUSDTransfer.$Shape;
        static create(properties?: types.EventCUSDTransfer.$Properties): types.EventCUSDTransfer;

        /**
         * Encodes the specified EventCUSDTransfer message. Does not implicitly {@link types.EventCUSDTransfer.verify|verify} messages.
         * @param message EventCUSDTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventCUSDTransfer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventCUSDTransfer message, length delimited. Does not implicitly {@link types.EventCUSDTransfer.verify|verify} messages.
         * @param message EventCUSDTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventCUSDTransfer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventCUSDTransfer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventCUSDTransfer & types.EventCUSDTransfer.$Shape} EventCUSDTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventCUSDTransfer & types.EventCUSDTransfer.$Shape;

        /**
         * Decodes an EventCUSDTransfer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventCUSDTransfer & types.EventCUSDTransfer.$Shape} EventCUSDTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventCUSDTransfer & types.EventCUSDTransfer.$Shape;

        /**
         * Verifies an EventCUSDTransfer message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventCUSDTransfer message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventCUSDTransfer
         */
        static fromObject(object: { [k: string]: any }): types.EventCUSDTransfer;

        /**
         * Creates a plain object from an EventCUSDTransfer message. Also converts values to other types if specified.
         * @param message EventCUSDTransfer
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventCUSDTransfer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventCUSDTransfer to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventCUSDTransfer
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventCUSDTransfer {

        /** Properties of an EventCUSDTransfer. */
        interface $Properties {

            /** EventCUSDTransfer fromAddress */
            fromAddress?: (Uint8Array|null);

            /** EventCUSDTransfer toAddress */
            toAddress?: (Uint8Array|null);

            /** EventCUSDTransfer amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventCUSDTransfer. */
        type $Shape = types.EventCUSDTransfer.$Properties;
    }

    /**
     * Properties of an EventLiquidated.
     * @deprecated Use types.EventLiquidated.$Properties instead.
     */
    interface IEventLiquidated extends types.EventLiquidated.$Properties {
    }

    /** Represents an EventLiquidated. */
    class EventLiquidated {

        /**
         * Constructs a new EventLiquidated.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventLiquidated.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventLiquidated vaultOwner. */
        vaultOwner: Uint8Array;

        /** EventLiquidated liquidator. */
        liquidator: Uint8Array;

        /** EventLiquidated repaid. */
        repaid: (number|Long);

        /** EventLiquidated seizedCollateral. */
        seizedCollateral: (number|Long);

        /** EventLiquidated remainingDebt. */
        remainingDebt: (number|Long);

        /** EventLiquidated remainingCollateral. */
        remainingCollateral: (number|Long);

        /**
         * Creates a new EventLiquidated instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventLiquidated instance
         */
        static create(properties: types.EventLiquidated.$Shape): types.EventLiquidated & types.EventLiquidated.$Shape;
        static create(properties?: types.EventLiquidated.$Properties): types.EventLiquidated;

        /**
         * Encodes the specified EventLiquidated message. Does not implicitly {@link types.EventLiquidated.verify|verify} messages.
         * @param message EventLiquidated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventLiquidated.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventLiquidated message, length delimited. Does not implicitly {@link types.EventLiquidated.verify|verify} messages.
         * @param message EventLiquidated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventLiquidated.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventLiquidated message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventLiquidated & types.EventLiquidated.$Shape} EventLiquidated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventLiquidated & types.EventLiquidated.$Shape;

        /**
         * Decodes an EventLiquidated message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventLiquidated & types.EventLiquidated.$Shape} EventLiquidated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventLiquidated & types.EventLiquidated.$Shape;

        /**
         * Verifies an EventLiquidated message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventLiquidated message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventLiquidated
         */
        static fromObject(object: { [k: string]: any }): types.EventLiquidated;

        /**
         * Creates a plain object from an EventLiquidated message. Also converts values to other types if specified.
         * @param message EventLiquidated
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventLiquidated, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventLiquidated to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventLiquidated
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventLiquidated {

        /** Properties of an EventLiquidated. */
        interface $Properties {

            /** EventLiquidated vaultOwner */
            vaultOwner?: (Uint8Array|null);

            /** EventLiquidated liquidator */
            liquidator?: (Uint8Array|null);

            /** EventLiquidated repaid */
            repaid?: (number|Long|null);

            /** EventLiquidated seizedCollateral */
            seizedCollateral?: (number|Long|null);

            /** EventLiquidated remainingDebt */
            remainingDebt?: (number|Long|null);

            /** EventLiquidated remainingCollateral */
            remainingCollateral?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventLiquidated. */
        type $Shape = types.EventLiquidated.$Properties;
    }

    /** Side enum. */
    enum Side {

        /** SIDE_UNSPECIFIED value */
        SIDE_UNSPECIFIED = 0,

        /** SIDE_BUY value */
        SIDE_BUY = 1,

        /** SIDE_SELL value */
        SIDE_SELL = 2
    }

    /**
     * Properties of a Holding.
     * @deprecated Use types.Holding.$Properties instead.
     */
    interface IHolding extends types.Holding.$Properties {
    }

    /** Represents a Holding. */
    class Holding {

        /**
         * Constructs a new Holding.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Holding.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Holding amount. */
        amount: (number|Long);

        /**
         * Creates a new Holding instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Holding instance
         */
        static create(properties: types.Holding.$Shape): types.Holding & types.Holding.$Shape;
        static create(properties?: types.Holding.$Properties): types.Holding;

        /**
         * Encodes the specified Holding message. Does not implicitly {@link types.Holding.verify|verify} messages.
         * @param message Holding message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Holding.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Holding message, length delimited. Does not implicitly {@link types.Holding.verify|verify} messages.
         * @param message Holding message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Holding.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Holding message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Holding & types.Holding.$Shape} Holding
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Holding & types.Holding.$Shape;

        /**
         * Decodes a Holding message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Holding & types.Holding.$Shape} Holding
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Holding & types.Holding.$Shape;

        /**
         * Verifies a Holding message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Holding message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Holding
         */
        static fromObject(object: { [k: string]: any }): types.Holding;

        /**
         * Creates a plain object from a Holding message. Also converts values to other types if specified.
         * @param message Holding
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Holding, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Holding to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Holding
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Holding {

        /** Properties of a Holding. */
        interface $Properties {

            /** Holding amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Holding. */
        type $Shape = types.Holding.$Properties;
    }

    /**
     * Properties of a UnitSupply.
     * @deprecated Use types.UnitSupply.$Properties instead.
     */
    interface IUnitSupply extends types.UnitSupply.$Properties {
    }

    /** Represents a UnitSupply. */
    class UnitSupply {

        /**
         * Constructs a new UnitSupply.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.UnitSupply.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** UnitSupply issued. */
        issued: (number|Long);

        /**
         * Creates a new UnitSupply instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnitSupply instance
         */
        static create(properties: types.UnitSupply.$Shape): types.UnitSupply & types.UnitSupply.$Shape;
        static create(properties?: types.UnitSupply.$Properties): types.UnitSupply;

        /**
         * Encodes the specified UnitSupply message. Does not implicitly {@link types.UnitSupply.verify|verify} messages.
         * @param message UnitSupply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.UnitSupply.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UnitSupply message, length delimited. Does not implicitly {@link types.UnitSupply.verify|verify} messages.
         * @param message UnitSupply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.UnitSupply.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UnitSupply message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.UnitSupply & types.UnitSupply.$Shape} UnitSupply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.UnitSupply & types.UnitSupply.$Shape;

        /**
         * Decodes a UnitSupply message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.UnitSupply & types.UnitSupply.$Shape} UnitSupply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.UnitSupply & types.UnitSupply.$Shape;

        /**
         * Verifies a UnitSupply message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UnitSupply message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UnitSupply
         */
        static fromObject(object: { [k: string]: any }): types.UnitSupply;

        /**
         * Creates a plain object from a UnitSupply message. Also converts values to other types if specified.
         * @param message UnitSupply
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.UnitSupply, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UnitSupply to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for UnitSupply
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace UnitSupply {

        /** Properties of a UnitSupply. */
        interface $Properties {

            /** UnitSupply issued */
            issued?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a UnitSupply. */
        type $Shape = types.UnitSupply.$Properties;
    }

    /**
     * Properties of an OrderMeta.
     * @deprecated Use types.OrderMeta.$Properties instead.
     */
    interface IOrderMeta extends types.OrderMeta.$Properties {
    }

    /** Represents an OrderMeta. */
    class OrderMeta {

        /**
         * Constructs a new OrderMeta.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.OrderMeta.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** OrderMeta orderCount. */
        orderCount: (number|Long);

        /**
         * Creates a new OrderMeta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OrderMeta instance
         */
        static create(properties: types.OrderMeta.$Shape): types.OrderMeta & types.OrderMeta.$Shape;
        static create(properties?: types.OrderMeta.$Properties): types.OrderMeta;

        /**
         * Encodes the specified OrderMeta message. Does not implicitly {@link types.OrderMeta.verify|verify} messages.
         * @param message OrderMeta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.OrderMeta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OrderMeta message, length delimited. Does not implicitly {@link types.OrderMeta.verify|verify} messages.
         * @param message OrderMeta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.OrderMeta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OrderMeta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.OrderMeta & types.OrderMeta.$Shape} OrderMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.OrderMeta & types.OrderMeta.$Shape;

        /**
         * Decodes an OrderMeta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.OrderMeta & types.OrderMeta.$Shape} OrderMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.OrderMeta & types.OrderMeta.$Shape;

        /**
         * Verifies an OrderMeta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OrderMeta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OrderMeta
         */
        static fromObject(object: { [k: string]: any }): types.OrderMeta;

        /**
         * Creates a plain object from an OrderMeta message. Also converts values to other types if specified.
         * @param message OrderMeta
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.OrderMeta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OrderMeta to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for OrderMeta
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace OrderMeta {

        /** Properties of an OrderMeta. */
        interface $Properties {

            /** OrderMeta orderCount */
            orderCount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an OrderMeta. */
        type $Shape = types.OrderMeta.$Properties;
    }

    /**
     * Properties of an Order.
     * @deprecated Use types.Order.$Properties instead.
     */
    interface IOrder extends types.Order.$Properties {
    }

    /** Represents an Order. */
    class Order {

        /**
         * Constructs a new Order.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Order.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Order id. */
        id: (number|Long);

        /** Order assetId. */
        assetId: (number|Long);

        /** Order owner. */
        owner: Uint8Array;

        /** Order side. */
        side: types.Side;

        /** Order price. */
        price: (number|Long);

        /** Order remaining. */
        remaining: (number|Long);

        /**
         * Creates a new Order instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Order instance
         */
        static create(properties: types.Order.$Shape): types.Order & types.Order.$Shape;
        static create(properties?: types.Order.$Properties): types.Order;

        /**
         * Encodes the specified Order message. Does not implicitly {@link types.Order.verify|verify} messages.
         * @param message Order message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Order.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Order message, length delimited. Does not implicitly {@link types.Order.verify|verify} messages.
         * @param message Order message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Order.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Order message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Order & types.Order.$Shape} Order
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Order & types.Order.$Shape;

        /**
         * Decodes an Order message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Order & types.Order.$Shape} Order
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Order & types.Order.$Shape;

        /**
         * Verifies an Order message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Order message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Order
         */
        static fromObject(object: { [k: string]: any }): types.Order;

        /**
         * Creates a plain object from an Order message. Also converts values to other types if specified.
         * @param message Order
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Order, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Order to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Order
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Order {

        /** Properties of an Order. */
        interface $Properties {

            /** Order id */
            id?: (number|Long|null);

            /** Order assetId */
            assetId?: (number|Long|null);

            /** Order owner */
            owner?: (Uint8Array|null);

            /** Order side */
            side?: (types.Side|null);

            /** Order price */
            price?: (number|Long|null);

            /** Order remaining */
            remaining?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an Order. */
        type $Shape = types.Order.$Properties;
    }

    /**
     * Properties of a MessageIssueUnits.
     * @deprecated Use types.MessageIssueUnits.$Properties instead.
     */
    interface IMessageIssueUnits extends types.MessageIssueUnits.$Properties {
    }

    /** Represents a MessageIssueUnits. */
    class MessageIssueUnits {

        /**
         * Constructs a new MessageIssueUnits.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageIssueUnits.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageIssueUnits assetId. */
        assetId: (number|Long);

        /** MessageIssueUnits to. */
        to: Uint8Array;

        /** MessageIssueUnits amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageIssueUnits instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageIssueUnits instance
         */
        static create(properties: types.MessageIssueUnits.$Shape): types.MessageIssueUnits & types.MessageIssueUnits.$Shape;
        static create(properties?: types.MessageIssueUnits.$Properties): types.MessageIssueUnits;

        /**
         * Encodes the specified MessageIssueUnits message. Does not implicitly {@link types.MessageIssueUnits.verify|verify} messages.
         * @param message MessageIssueUnits message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageIssueUnits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageIssueUnits message, length delimited. Does not implicitly {@link types.MessageIssueUnits.verify|verify} messages.
         * @param message MessageIssueUnits message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageIssueUnits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageIssueUnits message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageIssueUnits & types.MessageIssueUnits.$Shape} MessageIssueUnits
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageIssueUnits & types.MessageIssueUnits.$Shape;

        /**
         * Decodes a MessageIssueUnits message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageIssueUnits & types.MessageIssueUnits.$Shape} MessageIssueUnits
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageIssueUnits & types.MessageIssueUnits.$Shape;

        /**
         * Verifies a MessageIssueUnits message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageIssueUnits message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageIssueUnits
         */
        static fromObject(object: { [k: string]: any }): types.MessageIssueUnits;

        /**
         * Creates a plain object from a MessageIssueUnits message. Also converts values to other types if specified.
         * @param message MessageIssueUnits
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageIssueUnits, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageIssueUnits to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageIssueUnits
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageIssueUnits {

        /** Properties of a MessageIssueUnits. */
        interface $Properties {

            /** MessageIssueUnits assetId */
            assetId?: (number|Long|null);

            /** MessageIssueUnits to */
            to?: (Uint8Array|null);

            /** MessageIssueUnits amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageIssueUnits. */
        type $Shape = types.MessageIssueUnits.$Properties;
    }

    /**
     * Properties of a MessageTransferUnits.
     * @deprecated Use types.MessageTransferUnits.$Properties instead.
     */
    interface IMessageTransferUnits extends types.MessageTransferUnits.$Properties {
    }

    /** Represents a MessageTransferUnits. */
    class MessageTransferUnits {

        /**
         * Constructs a new MessageTransferUnits.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageTransferUnits.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageTransferUnits assetId. */
        assetId: (number|Long);

        /** MessageTransferUnits fromAddress. */
        fromAddress: Uint8Array;

        /** MessageTransferUnits toAddress. */
        toAddress: Uint8Array;

        /** MessageTransferUnits amount. */
        amount: (number|Long);

        /**
         * Creates a new MessageTransferUnits instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageTransferUnits instance
         */
        static create(properties: types.MessageTransferUnits.$Shape): types.MessageTransferUnits & types.MessageTransferUnits.$Shape;
        static create(properties?: types.MessageTransferUnits.$Properties): types.MessageTransferUnits;

        /**
         * Encodes the specified MessageTransferUnits message. Does not implicitly {@link types.MessageTransferUnits.verify|verify} messages.
         * @param message MessageTransferUnits message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageTransferUnits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageTransferUnits message, length delimited. Does not implicitly {@link types.MessageTransferUnits.verify|verify} messages.
         * @param message MessageTransferUnits message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageTransferUnits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageTransferUnits message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageTransferUnits & types.MessageTransferUnits.$Shape} MessageTransferUnits
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageTransferUnits & types.MessageTransferUnits.$Shape;

        /**
         * Decodes a MessageTransferUnits message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageTransferUnits & types.MessageTransferUnits.$Shape} MessageTransferUnits
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageTransferUnits & types.MessageTransferUnits.$Shape;

        /**
         * Verifies a MessageTransferUnits message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageTransferUnits message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageTransferUnits
         */
        static fromObject(object: { [k: string]: any }): types.MessageTransferUnits;

        /**
         * Creates a plain object from a MessageTransferUnits message. Also converts values to other types if specified.
         * @param message MessageTransferUnits
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageTransferUnits, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageTransferUnits to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageTransferUnits
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageTransferUnits {

        /** Properties of a MessageTransferUnits. */
        interface $Properties {

            /** MessageTransferUnits assetId */
            assetId?: (number|Long|null);

            /** MessageTransferUnits fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MessageTransferUnits toAddress */
            toAddress?: (Uint8Array|null);

            /** MessageTransferUnits amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageTransferUnits. */
        type $Shape = types.MessageTransferUnits.$Properties;
    }

    /**
     * Properties of a MessagePlaceOrder.
     * @deprecated Use types.MessagePlaceOrder.$Properties instead.
     */
    interface IMessagePlaceOrder extends types.MessagePlaceOrder.$Properties {
    }

    /** Represents a MessagePlaceOrder. */
    class MessagePlaceOrder {

        /**
         * Constructs a new MessagePlaceOrder.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessagePlaceOrder.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessagePlaceOrder assetId. */
        assetId: (number|Long);

        /** MessagePlaceOrder owner. */
        owner: Uint8Array;

        /** MessagePlaceOrder side. */
        side: types.Side;

        /** MessagePlaceOrder price. */
        price: (number|Long);

        /** MessagePlaceOrder amount. */
        amount: (number|Long);

        /**
         * Creates a new MessagePlaceOrder instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessagePlaceOrder instance
         */
        static create(properties: types.MessagePlaceOrder.$Shape): types.MessagePlaceOrder & types.MessagePlaceOrder.$Shape;
        static create(properties?: types.MessagePlaceOrder.$Properties): types.MessagePlaceOrder;

        /**
         * Encodes the specified MessagePlaceOrder message. Does not implicitly {@link types.MessagePlaceOrder.verify|verify} messages.
         * @param message MessagePlaceOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessagePlaceOrder.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessagePlaceOrder message, length delimited. Does not implicitly {@link types.MessagePlaceOrder.verify|verify} messages.
         * @param message MessagePlaceOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessagePlaceOrder.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessagePlaceOrder message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessagePlaceOrder & types.MessagePlaceOrder.$Shape} MessagePlaceOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessagePlaceOrder & types.MessagePlaceOrder.$Shape;

        /**
         * Decodes a MessagePlaceOrder message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessagePlaceOrder & types.MessagePlaceOrder.$Shape} MessagePlaceOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessagePlaceOrder & types.MessagePlaceOrder.$Shape;

        /**
         * Verifies a MessagePlaceOrder message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessagePlaceOrder message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessagePlaceOrder
         */
        static fromObject(object: { [k: string]: any }): types.MessagePlaceOrder;

        /**
         * Creates a plain object from a MessagePlaceOrder message. Also converts values to other types if specified.
         * @param message MessagePlaceOrder
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessagePlaceOrder, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessagePlaceOrder to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessagePlaceOrder
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessagePlaceOrder {

        /** Properties of a MessagePlaceOrder. */
        interface $Properties {

            /** MessagePlaceOrder assetId */
            assetId?: (number|Long|null);

            /** MessagePlaceOrder owner */
            owner?: (Uint8Array|null);

            /** MessagePlaceOrder side */
            side?: (types.Side|null);

            /** MessagePlaceOrder price */
            price?: (number|Long|null);

            /** MessagePlaceOrder amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessagePlaceOrder. */
        type $Shape = types.MessagePlaceOrder.$Properties;
    }

    /**
     * Properties of a MessageCancelOrder.
     * @deprecated Use types.MessageCancelOrder.$Properties instead.
     */
    interface IMessageCancelOrder extends types.MessageCancelOrder.$Properties {
    }

    /** Represents a MessageCancelOrder. */
    class MessageCancelOrder {

        /**
         * Constructs a new MessageCancelOrder.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageCancelOrder.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageCancelOrder owner. */
        owner: Uint8Array;

        /** MessageCancelOrder orderId. */
        orderId: (number|Long);

        /**
         * Creates a new MessageCancelOrder instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageCancelOrder instance
         */
        static create(properties: types.MessageCancelOrder.$Shape): types.MessageCancelOrder & types.MessageCancelOrder.$Shape;
        static create(properties?: types.MessageCancelOrder.$Properties): types.MessageCancelOrder;

        /**
         * Encodes the specified MessageCancelOrder message. Does not implicitly {@link types.MessageCancelOrder.verify|verify} messages.
         * @param message MessageCancelOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageCancelOrder.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageCancelOrder message, length delimited. Does not implicitly {@link types.MessageCancelOrder.verify|verify} messages.
         * @param message MessageCancelOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageCancelOrder.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageCancelOrder message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageCancelOrder & types.MessageCancelOrder.$Shape} MessageCancelOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageCancelOrder & types.MessageCancelOrder.$Shape;

        /**
         * Decodes a MessageCancelOrder message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageCancelOrder & types.MessageCancelOrder.$Shape} MessageCancelOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageCancelOrder & types.MessageCancelOrder.$Shape;

        /**
         * Verifies a MessageCancelOrder message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageCancelOrder message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageCancelOrder
         */
        static fromObject(object: { [k: string]: any }): types.MessageCancelOrder;

        /**
         * Creates a plain object from a MessageCancelOrder message. Also converts values to other types if specified.
         * @param message MessageCancelOrder
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageCancelOrder, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageCancelOrder to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageCancelOrder
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageCancelOrder {

        /** Properties of a MessageCancelOrder. */
        interface $Properties {

            /** MessageCancelOrder owner */
            owner?: (Uint8Array|null);

            /** MessageCancelOrder orderId */
            orderId?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageCancelOrder. */
        type $Shape = types.MessageCancelOrder.$Properties;
    }

    /**
     * Properties of an EventUnitsIssued.
     * @deprecated Use types.EventUnitsIssued.$Properties instead.
     */
    interface IEventUnitsIssued extends types.EventUnitsIssued.$Properties {
    }

    /** Represents an EventUnitsIssued. */
    class EventUnitsIssued {

        /**
         * Constructs a new EventUnitsIssued.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventUnitsIssued.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventUnitsIssued assetId. */
        assetId: (number|Long);

        /** EventUnitsIssued to. */
        to: Uint8Array;

        /** EventUnitsIssued amount. */
        amount: (number|Long);

        /** EventUnitsIssued issued. */
        issued: (number|Long);

        /**
         * Creates a new EventUnitsIssued instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventUnitsIssued instance
         */
        static create(properties: types.EventUnitsIssued.$Shape): types.EventUnitsIssued & types.EventUnitsIssued.$Shape;
        static create(properties?: types.EventUnitsIssued.$Properties): types.EventUnitsIssued;

        /**
         * Encodes the specified EventUnitsIssued message. Does not implicitly {@link types.EventUnitsIssued.verify|verify} messages.
         * @param message EventUnitsIssued message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventUnitsIssued.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventUnitsIssued message, length delimited. Does not implicitly {@link types.EventUnitsIssued.verify|verify} messages.
         * @param message EventUnitsIssued message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventUnitsIssued.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventUnitsIssued message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventUnitsIssued & types.EventUnitsIssued.$Shape} EventUnitsIssued
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventUnitsIssued & types.EventUnitsIssued.$Shape;

        /**
         * Decodes an EventUnitsIssued message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventUnitsIssued & types.EventUnitsIssued.$Shape} EventUnitsIssued
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventUnitsIssued & types.EventUnitsIssued.$Shape;

        /**
         * Verifies an EventUnitsIssued message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventUnitsIssued message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventUnitsIssued
         */
        static fromObject(object: { [k: string]: any }): types.EventUnitsIssued;

        /**
         * Creates a plain object from an EventUnitsIssued message. Also converts values to other types if specified.
         * @param message EventUnitsIssued
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventUnitsIssued, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventUnitsIssued to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventUnitsIssued
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventUnitsIssued {

        /** Properties of an EventUnitsIssued. */
        interface $Properties {

            /** EventUnitsIssued assetId */
            assetId?: (number|Long|null);

            /** EventUnitsIssued to */
            to?: (Uint8Array|null);

            /** EventUnitsIssued amount */
            amount?: (number|Long|null);

            /** EventUnitsIssued issued */
            issued?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventUnitsIssued. */
        type $Shape = types.EventUnitsIssued.$Properties;
    }

    /**
     * Properties of an EventUnitsTransferred.
     * @deprecated Use types.EventUnitsTransferred.$Properties instead.
     */
    interface IEventUnitsTransferred extends types.EventUnitsTransferred.$Properties {
    }

    /** Represents an EventUnitsTransferred. */
    class EventUnitsTransferred {

        /**
         * Constructs a new EventUnitsTransferred.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventUnitsTransferred.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventUnitsTransferred assetId. */
        assetId: (number|Long);

        /** EventUnitsTransferred fromAddress. */
        fromAddress: Uint8Array;

        /** EventUnitsTransferred toAddress. */
        toAddress: Uint8Array;

        /** EventUnitsTransferred amount. */
        amount: (number|Long);

        /**
         * Creates a new EventUnitsTransferred instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventUnitsTransferred instance
         */
        static create(properties: types.EventUnitsTransferred.$Shape): types.EventUnitsTransferred & types.EventUnitsTransferred.$Shape;
        static create(properties?: types.EventUnitsTransferred.$Properties): types.EventUnitsTransferred;

        /**
         * Encodes the specified EventUnitsTransferred message. Does not implicitly {@link types.EventUnitsTransferred.verify|verify} messages.
         * @param message EventUnitsTransferred message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventUnitsTransferred.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventUnitsTransferred message, length delimited. Does not implicitly {@link types.EventUnitsTransferred.verify|verify} messages.
         * @param message EventUnitsTransferred message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventUnitsTransferred.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventUnitsTransferred message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventUnitsTransferred & types.EventUnitsTransferred.$Shape} EventUnitsTransferred
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventUnitsTransferred & types.EventUnitsTransferred.$Shape;

        /**
         * Decodes an EventUnitsTransferred message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventUnitsTransferred & types.EventUnitsTransferred.$Shape} EventUnitsTransferred
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventUnitsTransferred & types.EventUnitsTransferred.$Shape;

        /**
         * Verifies an EventUnitsTransferred message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventUnitsTransferred message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventUnitsTransferred
         */
        static fromObject(object: { [k: string]: any }): types.EventUnitsTransferred;

        /**
         * Creates a plain object from an EventUnitsTransferred message. Also converts values to other types if specified.
         * @param message EventUnitsTransferred
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventUnitsTransferred, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventUnitsTransferred to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventUnitsTransferred
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventUnitsTransferred {

        /** Properties of an EventUnitsTransferred. */
        interface $Properties {

            /** EventUnitsTransferred assetId */
            assetId?: (number|Long|null);

            /** EventUnitsTransferred fromAddress */
            fromAddress?: (Uint8Array|null);

            /** EventUnitsTransferred toAddress */
            toAddress?: (Uint8Array|null);

            /** EventUnitsTransferred amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventUnitsTransferred. */
        type $Shape = types.EventUnitsTransferred.$Properties;
    }

    /**
     * Properties of an EventOrderPlaced.
     * @deprecated Use types.EventOrderPlaced.$Properties instead.
     */
    interface IEventOrderPlaced extends types.EventOrderPlaced.$Properties {
    }

    /** Represents an EventOrderPlaced. */
    class EventOrderPlaced {

        /**
         * Constructs a new EventOrderPlaced.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventOrderPlaced.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventOrderPlaced orderId. */
        orderId: (number|Long);

        /** EventOrderPlaced assetId. */
        assetId: (number|Long);

        /** EventOrderPlaced owner. */
        owner: Uint8Array;

        /** EventOrderPlaced side. */
        side: types.Side;

        /** EventOrderPlaced price. */
        price: (number|Long);

        /** EventOrderPlaced amount. */
        amount: (number|Long);

        /** EventOrderPlaced filled. */
        filled: (number|Long);

        /** EventOrderPlaced resting. */
        resting: boolean;

        /**
         * Creates a new EventOrderPlaced instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventOrderPlaced instance
         */
        static create(properties: types.EventOrderPlaced.$Shape): types.EventOrderPlaced & types.EventOrderPlaced.$Shape;
        static create(properties?: types.EventOrderPlaced.$Properties): types.EventOrderPlaced;

        /**
         * Encodes the specified EventOrderPlaced message. Does not implicitly {@link types.EventOrderPlaced.verify|verify} messages.
         * @param message EventOrderPlaced message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventOrderPlaced.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventOrderPlaced message, length delimited. Does not implicitly {@link types.EventOrderPlaced.verify|verify} messages.
         * @param message EventOrderPlaced message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventOrderPlaced.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventOrderPlaced message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventOrderPlaced & types.EventOrderPlaced.$Shape} EventOrderPlaced
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventOrderPlaced & types.EventOrderPlaced.$Shape;

        /**
         * Decodes an EventOrderPlaced message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventOrderPlaced & types.EventOrderPlaced.$Shape} EventOrderPlaced
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventOrderPlaced & types.EventOrderPlaced.$Shape;

        /**
         * Verifies an EventOrderPlaced message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventOrderPlaced message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventOrderPlaced
         */
        static fromObject(object: { [k: string]: any }): types.EventOrderPlaced;

        /**
         * Creates a plain object from an EventOrderPlaced message. Also converts values to other types if specified.
         * @param message EventOrderPlaced
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventOrderPlaced, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventOrderPlaced to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventOrderPlaced
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventOrderPlaced {

        /** Properties of an EventOrderPlaced. */
        interface $Properties {

            /** EventOrderPlaced orderId */
            orderId?: (number|Long|null);

            /** EventOrderPlaced assetId */
            assetId?: (number|Long|null);

            /** EventOrderPlaced owner */
            owner?: (Uint8Array|null);

            /** EventOrderPlaced side */
            side?: (types.Side|null);

            /** EventOrderPlaced price */
            price?: (number|Long|null);

            /** EventOrderPlaced amount */
            amount?: (number|Long|null);

            /** EventOrderPlaced filled */
            filled?: (number|Long|null);

            /** EventOrderPlaced resting */
            resting?: (boolean|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventOrderPlaced. */
        type $Shape = types.EventOrderPlaced.$Properties;
    }

    /**
     * Properties of an EventTrade.
     * @deprecated Use types.EventTrade.$Properties instead.
     */
    interface IEventTrade extends types.EventTrade.$Properties {
    }

    /** Represents an EventTrade. */
    class EventTrade {

        /**
         * Constructs a new EventTrade.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventTrade.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventTrade assetId. */
        assetId: (number|Long);

        /** EventTrade buyOrderId. */
        buyOrderId: (number|Long);

        /** EventTrade sellOrderId. */
        sellOrderId: (number|Long);

        /** EventTrade takerOrderId. */
        takerOrderId: (number|Long);

        /** EventTrade buyer. */
        buyer: Uint8Array;

        /** EventTrade seller. */
        seller: Uint8Array;

        /** EventTrade price. */
        price: (number|Long);

        /** EventTrade amount. */
        amount: (number|Long);

        /**
         * Creates a new EventTrade instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventTrade instance
         */
        static create(properties: types.EventTrade.$Shape): types.EventTrade & types.EventTrade.$Shape;
        static create(properties?: types.EventTrade.$Properties): types.EventTrade;

        /**
         * Encodes the specified EventTrade message. Does not implicitly {@link types.EventTrade.verify|verify} messages.
         * @param message EventTrade message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventTrade.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventTrade message, length delimited. Does not implicitly {@link types.EventTrade.verify|verify} messages.
         * @param message EventTrade message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventTrade.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventTrade message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventTrade & types.EventTrade.$Shape} EventTrade
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventTrade & types.EventTrade.$Shape;

        /**
         * Decodes an EventTrade message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventTrade & types.EventTrade.$Shape} EventTrade
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventTrade & types.EventTrade.$Shape;

        /**
         * Verifies an EventTrade message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventTrade message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventTrade
         */
        static fromObject(object: { [k: string]: any }): types.EventTrade;

        /**
         * Creates a plain object from an EventTrade message. Also converts values to other types if specified.
         * @param message EventTrade
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventTrade, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventTrade to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventTrade
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventTrade {

        /** Properties of an EventTrade. */
        interface $Properties {

            /** EventTrade assetId */
            assetId?: (number|Long|null);

            /** EventTrade buyOrderId */
            buyOrderId?: (number|Long|null);

            /** EventTrade sellOrderId */
            sellOrderId?: (number|Long|null);

            /** EventTrade takerOrderId */
            takerOrderId?: (number|Long|null);

            /** EventTrade buyer */
            buyer?: (Uint8Array|null);

            /** EventTrade seller */
            seller?: (Uint8Array|null);

            /** EventTrade price */
            price?: (number|Long|null);

            /** EventTrade amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventTrade. */
        type $Shape = types.EventTrade.$Properties;
    }

    /**
     * Properties of an EventOrderCancelled.
     * @deprecated Use types.EventOrderCancelled.$Properties instead.
     */
    interface IEventOrderCancelled extends types.EventOrderCancelled.$Properties {
    }

    /** Represents an EventOrderCancelled. */
    class EventOrderCancelled {

        /**
         * Constructs a new EventOrderCancelled.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventOrderCancelled.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventOrderCancelled orderId. */
        orderId: (number|Long);

        /** EventOrderCancelled assetId. */
        assetId: (number|Long);

        /** EventOrderCancelled owner. */
        owner: Uint8Array;

        /** EventOrderCancelled remaining. */
        remaining: (number|Long);

        /** EventOrderCancelled reason. */
        reason: string;

        /**
         * Creates a new EventOrderCancelled instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventOrderCancelled instance
         */
        static create(properties: types.EventOrderCancelled.$Shape): types.EventOrderCancelled & types.EventOrderCancelled.$Shape;
        static create(properties?: types.EventOrderCancelled.$Properties): types.EventOrderCancelled;

        /**
         * Encodes the specified EventOrderCancelled message. Does not implicitly {@link types.EventOrderCancelled.verify|verify} messages.
         * @param message EventOrderCancelled message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventOrderCancelled.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventOrderCancelled message, length delimited. Does not implicitly {@link types.EventOrderCancelled.verify|verify} messages.
         * @param message EventOrderCancelled message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventOrderCancelled.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventOrderCancelled message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventOrderCancelled & types.EventOrderCancelled.$Shape} EventOrderCancelled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventOrderCancelled & types.EventOrderCancelled.$Shape;

        /**
         * Decodes an EventOrderCancelled message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventOrderCancelled & types.EventOrderCancelled.$Shape} EventOrderCancelled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventOrderCancelled & types.EventOrderCancelled.$Shape;

        /**
         * Verifies an EventOrderCancelled message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventOrderCancelled message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventOrderCancelled
         */
        static fromObject(object: { [k: string]: any }): types.EventOrderCancelled;

        /**
         * Creates a plain object from an EventOrderCancelled message. Also converts values to other types if specified.
         * @param message EventOrderCancelled
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventOrderCancelled, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventOrderCancelled to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventOrderCancelled
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventOrderCancelled {

        /** Properties of an EventOrderCancelled. */
        interface $Properties {

            /** EventOrderCancelled orderId */
            orderId?: (number|Long|null);

            /** EventOrderCancelled assetId */
            assetId?: (number|Long|null);

            /** EventOrderCancelled owner */
            owner?: (Uint8Array|null);

            /** EventOrderCancelled remaining */
            remaining?: (number|Long|null);

            /** EventOrderCancelled reason */
            reason?: (string|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventOrderCancelled. */
        type $Shape = types.EventOrderCancelled.$Properties;
    }

    /**
     * Properties of an OracleParams.
     * @deprecated Use types.OracleParams.$Properties instead.
     */
    interface IOracleParams extends types.OracleParams.$Properties {
    }

    /** Represents an OracleParams. */
    class OracleParams {

        /**
         * Constructs a new OracleParams.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.OracleParams.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** OracleParams bucketBlocks. */
        bucketBlocks: (number|Long);

        /** OracleParams windowBuckets. */
        windowBuckets: number;

        /** OracleParams minBuckets. */
        minBuckets: number;

        /** OracleParams minNotional. */
        minNotional: (number|Long);

        /**
         * Creates a new OracleParams instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OracleParams instance
         */
        static create(properties: types.OracleParams.$Shape): types.OracleParams & types.OracleParams.$Shape;
        static create(properties?: types.OracleParams.$Properties): types.OracleParams;

        /**
         * Encodes the specified OracleParams message. Does not implicitly {@link types.OracleParams.verify|verify} messages.
         * @param message OracleParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.OracleParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OracleParams message, length delimited. Does not implicitly {@link types.OracleParams.verify|verify} messages.
         * @param message OracleParams message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.OracleParams.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OracleParams message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.OracleParams & types.OracleParams.$Shape} OracleParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.OracleParams & types.OracleParams.$Shape;

        /**
         * Decodes an OracleParams message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.OracleParams & types.OracleParams.$Shape} OracleParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.OracleParams & types.OracleParams.$Shape;

        /**
         * Verifies an OracleParams message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OracleParams message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OracleParams
         */
        static fromObject(object: { [k: string]: any }): types.OracleParams;

        /**
         * Creates a plain object from an OracleParams message. Also converts values to other types if specified.
         * @param message OracleParams
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.OracleParams, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OracleParams to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for OracleParams
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace OracleParams {

        /** Properties of an OracleParams. */
        interface $Properties {

            /** OracleParams bucketBlocks */
            bucketBlocks?: (number|Long|null);

            /** OracleParams windowBuckets */
            windowBuckets?: (number|null);

            /** OracleParams minBuckets */
            minBuckets?: (number|null);

            /** OracleParams minNotional */
            minNotional?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an OracleParams. */
        type $Shape = types.OracleParams.$Properties;
    }

    /**
     * Properties of an OracleConfig.
     * @deprecated Use types.OracleConfig.$Properties instead.
     */
    interface IOracleConfig extends types.OracleConfig.$Properties {
    }

    /** Represents an OracleConfig. */
    class OracleConfig {

        /**
         * Constructs a new OracleConfig.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.OracleConfig.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** OracleConfig reporters. */
        reporters: Uint8Array[];

        /** OracleConfig params. */
        params?: (types.OracleParams.$Properties|null);

        /**
         * Creates a new OracleConfig instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OracleConfig instance
         */
        static create(properties: types.OracleConfig.$Shape): types.OracleConfig & types.OracleConfig.$Shape;
        static create(properties?: types.OracleConfig.$Properties): types.OracleConfig;

        /**
         * Encodes the specified OracleConfig message. Does not implicitly {@link types.OracleConfig.verify|verify} messages.
         * @param message OracleConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.OracleConfig.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OracleConfig message, length delimited. Does not implicitly {@link types.OracleConfig.verify|verify} messages.
         * @param message OracleConfig message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.OracleConfig.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OracleConfig message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.OracleConfig & types.OracleConfig.$Shape} OracleConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.OracleConfig & types.OracleConfig.$Shape;

        /**
         * Decodes an OracleConfig message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.OracleConfig & types.OracleConfig.$Shape} OracleConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.OracleConfig & types.OracleConfig.$Shape;

        /**
         * Verifies an OracleConfig message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OracleConfig message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OracleConfig
         */
        static fromObject(object: { [k: string]: any }): types.OracleConfig;

        /**
         * Creates a plain object from an OracleConfig message. Also converts values to other types if specified.
         * @param message OracleConfig
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.OracleConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OracleConfig to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for OracleConfig
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace OracleConfig {

        /** Properties of an OracleConfig. */
        interface $Properties {

            /** OracleConfig reporters */
            reporters?: (Uint8Array[]|null);

            /** OracleConfig params */
            params?: (types.OracleParams.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an OracleConfig. */
        type $Shape = types.OracleConfig.$Properties;
    }

    /**
     * Properties of a Report.
     * @deprecated Use types.Report.$Properties instead.
     */
    interface IReport extends types.Report.$Properties {
    }

    /** Represents a Report. */
    class Report {

        /**
         * Constructs a new Report.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Report.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Report price. */
        price: (number|Long);

        /** Report height. */
        height: (number|Long);

        /**
         * Creates a new Report instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Report instance
         */
        static create(properties: types.Report.$Shape): types.Report & types.Report.$Shape;
        static create(properties?: types.Report.$Properties): types.Report;

        /**
         * Encodes the specified Report message. Does not implicitly {@link types.Report.verify|verify} messages.
         * @param message Report message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Report.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Report message, length delimited. Does not implicitly {@link types.Report.verify|verify} messages.
         * @param message Report message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Report.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Report message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Report & types.Report.$Shape} Report
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Report & types.Report.$Shape;

        /**
         * Decodes a Report message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Report & types.Report.$Shape} Report
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Report & types.Report.$Shape;

        /**
         * Verifies a Report message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Report message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Report
         */
        static fromObject(object: { [k: string]: any }): types.Report;

        /**
         * Creates a plain object from a Report message. Also converts values to other types if specified.
         * @param message Report
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Report, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Report to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Report
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Report {

        /** Properties of a Report. */
        interface $Properties {

            /** Report price */
            price?: (number|Long|null);

            /** Report height */
            height?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Report. */
        type $Shape = types.Report.$Properties;
    }

    /**
     * Properties of a Bucket.
     * @deprecated Use types.Bucket.$Properties instead.
     */
    interface IBucket extends types.Bucket.$Properties {
    }

    /** Represents a Bucket. */
    class Bucket {

        /**
         * Constructs a new Bucket.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Bucket.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Bucket index. */
        index: (number|Long);

        /** Bucket notional. */
        notional: (number|Long);

        /** Bucket units. */
        units: (number|Long);

        /**
         * Creates a new Bucket instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Bucket instance
         */
        static create(properties: types.Bucket.$Shape): types.Bucket & types.Bucket.$Shape;
        static create(properties?: types.Bucket.$Properties): types.Bucket;

        /**
         * Encodes the specified Bucket message. Does not implicitly {@link types.Bucket.verify|verify} messages.
         * @param message Bucket message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Bucket.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Bucket message, length delimited. Does not implicitly {@link types.Bucket.verify|verify} messages.
         * @param message Bucket message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Bucket.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Bucket message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Bucket & types.Bucket.$Shape} Bucket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Bucket & types.Bucket.$Shape;

        /**
         * Decodes a Bucket message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Bucket & types.Bucket.$Shape} Bucket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Bucket & types.Bucket.$Shape;

        /**
         * Verifies a Bucket message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Bucket message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Bucket
         */
        static fromObject(object: { [k: string]: any }): types.Bucket;

        /**
         * Creates a plain object from a Bucket message. Also converts values to other types if specified.
         * @param message Bucket
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Bucket, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Bucket to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Bucket
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Bucket {

        /** Properties of a Bucket. */
        interface $Properties {

            /** Bucket index */
            index?: (number|Long|null);

            /** Bucket notional */
            notional?: (number|Long|null);

            /** Bucket units */
            units?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Bucket. */
        type $Shape = types.Bucket.$Properties;
    }

    /**
     * Properties of an AssetOracle.
     * @deprecated Use types.AssetOracle.$Properties instead.
     */
    interface IAssetOracle extends types.AssetOracle.$Properties {
    }

    /** Represents an AssetOracle. */
    class AssetOracle {

        /**
         * Constructs a new AssetOracle.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.AssetOracle.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** AssetOracle buckets. */
        buckets: types.Bucket.$Properties[];

        /** AssetOracle lastPrice. */
        lastPrice: (number|Long);

        /** AssetOracle lastHeight. */
        lastHeight: (number|Long);

        /**
         * Creates a new AssetOracle instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AssetOracle instance
         */
        static create(properties: types.AssetOracle.$Shape): types.AssetOracle & types.AssetOracle.$Shape;
        static create(properties?: types.AssetOracle.$Properties): types.AssetOracle;

        /**
         * Encodes the specified AssetOracle message. Does not implicitly {@link types.AssetOracle.verify|verify} messages.
         * @param message AssetOracle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.AssetOracle.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AssetOracle message, length delimited. Does not implicitly {@link types.AssetOracle.verify|verify} messages.
         * @param message AssetOracle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.AssetOracle.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AssetOracle message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.AssetOracle & types.AssetOracle.$Shape} AssetOracle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.AssetOracle & types.AssetOracle.$Shape;

        /**
         * Decodes an AssetOracle message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.AssetOracle & types.AssetOracle.$Shape} AssetOracle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.AssetOracle & types.AssetOracle.$Shape;

        /**
         * Verifies an AssetOracle message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AssetOracle message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AssetOracle
         */
        static fromObject(object: { [k: string]: any }): types.AssetOracle;

        /**
         * Creates a plain object from an AssetOracle message. Also converts values to other types if specified.
         * @param message AssetOracle
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.AssetOracle, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AssetOracle to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for AssetOracle
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace AssetOracle {

        /** Properties of an AssetOracle. */
        interface $Properties {

            /** AssetOracle buckets */
            buckets?: (types.Bucket.$Properties[]|null);

            /** AssetOracle lastPrice */
            lastPrice?: (number|Long|null);

            /** AssetOracle lastHeight */
            lastHeight?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an AssetOracle. */
        type $Shape = types.AssetOracle.$Properties;
    }

    /**
     * Properties of a MessageSetOracle.
     * @deprecated Use types.MessageSetOracle.$Properties instead.
     */
    interface IMessageSetOracle extends types.MessageSetOracle.$Properties {
    }

    /** Represents a MessageSetOracle. */
    class MessageSetOracle {

        /**
         * Constructs a new MessageSetOracle.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageSetOracle.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageSetOracle config. */
        config?: (types.OracleConfig.$Properties|null);

        /**
         * Creates a new MessageSetOracle instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageSetOracle instance
         */
        static create(properties: types.MessageSetOracle.$Shape): types.MessageSetOracle & types.MessageSetOracle.$Shape;
        static create(properties?: types.MessageSetOracle.$Properties): types.MessageSetOracle;

        /**
         * Encodes the specified MessageSetOracle message. Does not implicitly {@link types.MessageSetOracle.verify|verify} messages.
         * @param message MessageSetOracle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageSetOracle.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageSetOracle message, length delimited. Does not implicitly {@link types.MessageSetOracle.verify|verify} messages.
         * @param message MessageSetOracle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageSetOracle.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageSetOracle message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageSetOracle & types.MessageSetOracle.$Shape} MessageSetOracle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageSetOracle & types.MessageSetOracle.$Shape;

        /**
         * Decodes a MessageSetOracle message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageSetOracle & types.MessageSetOracle.$Shape} MessageSetOracle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageSetOracle & types.MessageSetOracle.$Shape;

        /**
         * Verifies a MessageSetOracle message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageSetOracle message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageSetOracle
         */
        static fromObject(object: { [k: string]: any }): types.MessageSetOracle;

        /**
         * Creates a plain object from a MessageSetOracle message. Also converts values to other types if specified.
         * @param message MessageSetOracle
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageSetOracle, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageSetOracle to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageSetOracle
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageSetOracle {

        /** Properties of a MessageSetOracle. */
        interface $Properties {

            /** MessageSetOracle config */
            config?: (types.OracleConfig.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageSetOracle. */
        type $Shape = types.MessageSetOracle.$Properties;
    }

    /**
     * Properties of a MessageReportPrice.
     * @deprecated Use types.MessageReportPrice.$Properties instead.
     */
    interface IMessageReportPrice extends types.MessageReportPrice.$Properties {
    }

    /** Represents a MessageReportPrice. */
    class MessageReportPrice {

        /**
         * Constructs a new MessageReportPrice.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.MessageReportPrice.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** MessageReportPrice reporter. */
        reporter: Uint8Array;

        /** MessageReportPrice price. */
        price: (number|Long);

        /**
         * Creates a new MessageReportPrice instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageReportPrice instance
         */
        static create(properties: types.MessageReportPrice.$Shape): types.MessageReportPrice & types.MessageReportPrice.$Shape;
        static create(properties?: types.MessageReportPrice.$Properties): types.MessageReportPrice;

        /**
         * Encodes the specified MessageReportPrice message. Does not implicitly {@link types.MessageReportPrice.verify|verify} messages.
         * @param message MessageReportPrice message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.MessageReportPrice.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageReportPrice message, length delimited. Does not implicitly {@link types.MessageReportPrice.verify|verify} messages.
         * @param message MessageReportPrice message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.MessageReportPrice.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageReportPrice message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.MessageReportPrice & types.MessageReportPrice.$Shape} MessageReportPrice
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageReportPrice & types.MessageReportPrice.$Shape;

        /**
         * Decodes a MessageReportPrice message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.MessageReportPrice & types.MessageReportPrice.$Shape} MessageReportPrice
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageReportPrice & types.MessageReportPrice.$Shape;

        /**
         * Verifies a MessageReportPrice message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageReportPrice message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageReportPrice
         */
        static fromObject(object: { [k: string]: any }): types.MessageReportPrice;

        /**
         * Creates a plain object from a MessageReportPrice message. Also converts values to other types if specified.
         * @param message MessageReportPrice
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.MessageReportPrice, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageReportPrice to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for MessageReportPrice
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace MessageReportPrice {

        /** Properties of a MessageReportPrice. */
        interface $Properties {

            /** MessageReportPrice reporter */
            reporter?: (Uint8Array|null);

            /** MessageReportPrice price */
            price?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a MessageReportPrice. */
        type $Shape = types.MessageReportPrice.$Properties;
    }

    /**
     * Properties of an EventOracleSet.
     * @deprecated Use types.EventOracleSet.$Properties instead.
     */
    interface IEventOracleSet extends types.EventOracleSet.$Properties {
    }

    /** Represents an EventOracleSet. */
    class EventOracleSet {

        /**
         * Constructs a new EventOracleSet.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventOracleSet.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventOracleSet reporters. */
        reporters: number;

        /**
         * Creates a new EventOracleSet instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventOracleSet instance
         */
        static create(properties: types.EventOracleSet.$Shape): types.EventOracleSet & types.EventOracleSet.$Shape;
        static create(properties?: types.EventOracleSet.$Properties): types.EventOracleSet;

        /**
         * Encodes the specified EventOracleSet message. Does not implicitly {@link types.EventOracleSet.verify|verify} messages.
         * @param message EventOracleSet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventOracleSet.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventOracleSet message, length delimited. Does not implicitly {@link types.EventOracleSet.verify|verify} messages.
         * @param message EventOracleSet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventOracleSet.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventOracleSet message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventOracleSet & types.EventOracleSet.$Shape} EventOracleSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventOracleSet & types.EventOracleSet.$Shape;

        /**
         * Decodes an EventOracleSet message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventOracleSet & types.EventOracleSet.$Shape} EventOracleSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventOracleSet & types.EventOracleSet.$Shape;

        /**
         * Verifies an EventOracleSet message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventOracleSet message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventOracleSet
         */
        static fromObject(object: { [k: string]: any }): types.EventOracleSet;

        /**
         * Creates a plain object from an EventOracleSet message. Also converts values to other types if specified.
         * @param message EventOracleSet
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventOracleSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventOracleSet to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventOracleSet
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventOracleSet {

        /** Properties of an EventOracleSet. */
        interface $Properties {

            /** EventOracleSet reporters */
            reporters?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventOracleSet. */
        type $Shape = types.EventOracleSet.$Properties;
    }

    /**
     * Properties of an EventPriceReported.
     * @deprecated Use types.EventPriceReported.$Properties instead.
     */
    interface IEventPriceReported extends types.EventPriceReported.$Properties {
    }

    /** Represents an EventPriceReported. */
    class EventPriceReported {

        /**
         * Constructs a new EventPriceReported.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventPriceReported.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventPriceReported reporter. */
        reporter: Uint8Array;

        /** EventPriceReported price. */
        price: (number|Long);

        /** EventPriceReported fresh. */
        fresh: number;

        /** EventPriceReported quorum. */
        quorum: number;

        /** EventPriceReported aggregate. */
        aggregate: (number|Long);

        /** EventPriceReported updated. */
        updated: boolean;

        /**
         * Creates a new EventPriceReported instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventPriceReported instance
         */
        static create(properties: types.EventPriceReported.$Shape): types.EventPriceReported & types.EventPriceReported.$Shape;
        static create(properties?: types.EventPriceReported.$Properties): types.EventPriceReported;

        /**
         * Encodes the specified EventPriceReported message. Does not implicitly {@link types.EventPriceReported.verify|verify} messages.
         * @param message EventPriceReported message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventPriceReported.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventPriceReported message, length delimited. Does not implicitly {@link types.EventPriceReported.verify|verify} messages.
         * @param message EventPriceReported message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventPriceReported.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventPriceReported message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventPriceReported & types.EventPriceReported.$Shape} EventPriceReported
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventPriceReported & types.EventPriceReported.$Shape;

        /**
         * Decodes an EventPriceReported message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventPriceReported & types.EventPriceReported.$Shape} EventPriceReported
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventPriceReported & types.EventPriceReported.$Shape;

        /**
         * Verifies an EventPriceReported message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventPriceReported message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventPriceReported
         */
        static fromObject(object: { [k: string]: any }): types.EventPriceReported;

        /**
         * Creates a plain object from an EventPriceReported message. Also converts values to other types if specified.
         * @param message EventPriceReported
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventPriceReported, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventPriceReported to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventPriceReported
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventPriceReported {

        /** Properties of an EventPriceReported. */
        interface $Properties {

            /** EventPriceReported reporter */
            reporter?: (Uint8Array|null);

            /** EventPriceReported price */
            price?: (number|Long|null);

            /** EventPriceReported fresh */
            fresh?: (number|null);

            /** EventPriceReported quorum */
            quorum?: (number|null);

            /** EventPriceReported aggregate */
            aggregate?: (number|Long|null);

            /** EventPriceReported updated */
            updated?: (boolean|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventPriceReported. */
        type $Shape = types.EventPriceReported.$Properties;
    }

    /**
     * Properties of an Event.
     * @deprecated Use types.Event.$Properties instead.
     */
    interface IEvent extends types.Event.$Properties {
    }

    /** Represents an Event. */
    class Event {

        /**
         * Constructs a new Event.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Event.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Event eventType. */
        eventType: string;

        /** Event custom. */
        custom?: (types.EventCustom.$Properties|null);

        /** Event height. */
        height: (number|Long);

        /** Event reference. */
        reference: string;

        /** Event chainId. */
        chainId: (number|Long);

        /** Event blockHeight. */
        blockHeight: (number|Long);

        /** Event blockHash. */
        blockHash: Uint8Array;

        /** Event address. */
        address: Uint8Array;

        /** Event msg. */
        msg?: "custom";

        /**
         * Creates a new Event instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Event instance
         */
        static create(properties: types.Event.$Shape): types.Event & types.Event.$Shape;
        static create(properties?: types.Event.$Properties): types.Event;

        /**
         * Encodes the specified Event message. Does not implicitly {@link types.Event.verify|verify} messages.
         * @param message Event message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Event message, length delimited. Does not implicitly {@link types.Event.verify|verify} messages.
         * @param message Event message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Event.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Event message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Event & types.Event.$Shape} Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Event & types.Event.$Shape;

        /**
         * Decodes an Event message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Event & types.Event.$Shape} Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Event & types.Event.$Shape;

        /**
         * Verifies an Event message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Event message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Event
         */
        static fromObject(object: { [k: string]: any }): types.Event;

        /**
         * Creates a plain object from an Event message. Also converts values to other types if specified.
         * @param message Event
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Event to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Event
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Event {

        /** Properties of an Event. */
        interface $Properties {

            /** Event eventType */
            eventType?: (string|null);

            /** Event custom */
            custom?: (types.EventCustom.$Properties|null);

            /** Event height */
            height?: (number|Long|null);

            /** Event reference */
            reference?: (string|null);

            /** Event chainId */
            chainId?: (number|Long|null);

            /** Event blockHeight */
            blockHeight?: (number|Long|null);

            /** Event blockHash */
            blockHash?: (Uint8Array|null);

            /** Event address */
            address?: (Uint8Array|null);

            /** Event msg */
            msg?: "custom";

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Narrowed shape of an Event. */
        type $Shape = {
          eventType?: string|null;
          custom?: types.EventCustom.$Shape|null;
          height?: number|Long|null;
          reference?: string|null;
          chainId?: number|Long|null;
          blockHeight?: number|Long|null;
          blockHash?: Uint8Array|null;
          address?: Uint8Array|null;
          $unknowns?: Uint8Array[];
        } & (
          ({ msg?: undefined; custom?: null }|{ msg?: "custom"; custom: types.EventCustom.$Shape })
        );
    }

    /**
     * Properties of an EventCustom.
     * @deprecated Use types.EventCustom.$Properties instead.
     */
    interface IEventCustom extends types.EventCustom.$Properties {
    }

    /** Represents an EventCustom. */
    class EventCustom {

        /**
         * Constructs a new EventCustom.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.EventCustom.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** EventCustom msg. */
        msg?: (google.protobuf.Any.$Properties|null);

        /**
         * Creates a new EventCustom instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventCustom instance
         */
        static create(properties: types.EventCustom.$Shape): types.EventCustom & types.EventCustom.$Shape;
        static create(properties?: types.EventCustom.$Properties): types.EventCustom;

        /**
         * Encodes the specified EventCustom message. Does not implicitly {@link types.EventCustom.verify|verify} messages.
         * @param message EventCustom message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.EventCustom.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventCustom message, length delimited. Does not implicitly {@link types.EventCustom.verify|verify} messages.
         * @param message EventCustom message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.EventCustom.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventCustom message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.EventCustom & types.EventCustom.$Shape} EventCustom
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.EventCustom & types.EventCustom.$Shape;

        /**
         * Decodes an EventCustom message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.EventCustom & types.EventCustom.$Shape} EventCustom
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.EventCustom & types.EventCustom.$Shape;

        /**
         * Verifies an EventCustom message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventCustom message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventCustom
         */
        static fromObject(object: { [k: string]: any }): types.EventCustom;

        /**
         * Creates a plain object from an EventCustom message. Also converts values to other types if specified.
         * @param message EventCustom
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.EventCustom, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventCustom to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for EventCustom
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace EventCustom {

        /** Properties of an EventCustom. */
        interface $Properties {

            /** EventCustom msg */
            msg?: (google.protobuf.Any.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an EventCustom. */
        type $Shape = types.EventCustom.$Properties;
    }

    /**
     * Properties of an Account.
     * @deprecated Use types.Account.$Properties instead.
     */
    interface IAccount extends types.Account.$Properties {
    }

    /** Represents an Account. */
    class Account {

        /**
         * Constructs a new Account.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Account.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Account address. */
        address: Uint8Array;

        /** Account amount. */
        amount: (number|Long);

        /** Account nonce. */
        nonce: (number|Long);

        /**
         * Creates a new Account instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Account instance
         */
        static create(properties: types.Account.$Shape): types.Account & types.Account.$Shape;
        static create(properties?: types.Account.$Properties): types.Account;

        /**
         * Encodes the specified Account message. Does not implicitly {@link types.Account.verify|verify} messages.
         * @param message Account message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Account.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Account message, length delimited. Does not implicitly {@link types.Account.verify|verify} messages.
         * @param message Account message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Account.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Account message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Account & types.Account.$Shape} Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Account & types.Account.$Shape;

        /**
         * Decodes an Account message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Account & types.Account.$Shape} Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Account & types.Account.$Shape;

        /**
         * Verifies an Account message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Account message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Account
         */
        static fromObject(object: { [k: string]: any }): types.Account;

        /**
         * Creates a plain object from an Account message. Also converts values to other types if specified.
         * @param message Account
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Account to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Account
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Account {

        /** Properties of an Account. */
        interface $Properties {

            /** Account address */
            address?: (Uint8Array|null);

            /** Account amount */
            amount?: (number|Long|null);

            /** Account nonce */
            nonce?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an Account. */
        type $Shape = types.Account.$Properties;
    }

    /**
     * Properties of a Pool.
     * @deprecated Use types.Pool.$Properties instead.
     */
    interface IPool extends types.Pool.$Properties {
    }

    /** Represents a Pool. */
    class Pool {

        /**
         * Constructs a new Pool.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.Pool.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Pool id. */
        id: (number|Long);

        /** Pool amount. */
        amount: (number|Long);

        /**
         * Creates a new Pool instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pool instance
         */
        static create(properties: types.Pool.$Shape): types.Pool & types.Pool.$Shape;
        static create(properties?: types.Pool.$Properties): types.Pool;

        /**
         * Encodes the specified Pool message. Does not implicitly {@link types.Pool.verify|verify} messages.
         * @param message Pool message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: types.Pool.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Pool message, length delimited. Does not implicitly {@link types.Pool.verify|verify} messages.
         * @param message Pool message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: types.Pool.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Pool message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {types.Pool & types.Pool.$Shape} Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Pool & types.Pool.$Shape;

        /**
         * Decodes a Pool message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {types.Pool & types.Pool.$Shape} Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Pool & types.Pool.$Shape;

        /**
         * Verifies a Pool message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pool message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pool
         */
        static fromObject(object: { [k: string]: any }): types.Pool;

        /**
         * Creates a plain object from a Pool message. Also converts values to other types if specified.
         * @param message Pool
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: types.Pool, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pool to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Pool
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Pool {

        /** Properties of a Pool. */
        interface $Properties {

            /** Pool id */
            id?: (number|Long|null);

            /** Pool amount */
            amount?: (number|Long|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Pool. */
        type $Shape = types.Pool.$Properties;
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /**
         * Properties of an Any.
         * @deprecated Use google.protobuf.Any.$Properties instead.
         */
        interface IAny extends google.protobuf.Any.$Properties {
        }

        /** Represents an Any. */
        class Any {

            /**
             * Constructs a new Any.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.Any.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Any type_url. */
            type_url: string;

            /** Any value. */
            value: Uint8Array;

            /**
             * Creates a new Any instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Any instance
             */
            static create(properties: google.protobuf.Any.$Shape): google.protobuf.Any & google.protobuf.Any.$Shape;
            static create(properties?: google.protobuf.Any.$Properties): google.protobuf.Any;

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: google.protobuf.Any.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: google.protobuf.Any.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {google.protobuf.Any & google.protobuf.Any.$Shape} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Any & google.protobuf.Any.$Shape;

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {google.protobuf.Any & google.protobuf.Any.$Shape} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Any & google.protobuf.Any.$Shape;

            /**
             * Verifies an Any message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Any
             */
            static fromObject(object: { [k: string]: any }): google.protobuf.Any;

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @param message Any
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: google.protobuf.Any, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Any to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Any
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Any {

            /** Properties of an Any. */
            interface $Properties {

                /** Any type_url */
                type_url?: (string|null);

                /** Any value */
                value?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Any. */
            type $Shape = google.protobuf.Any.$Properties;
        }
    }
}
