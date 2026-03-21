# SOAP (Simple Object Access Protocol)

SOAP is a protocol for exchanging structured information in the implementation of web services. It relies on XML for its message format and typically uses HTTP or SMTP as the transport protocol. While REST has become the dominant style for new APIs, SOAP remains widely used in enterprise environments, financial services, and government systems where strict contracts and built-in security are required.

## Key Components

| Component | Description |
|-----------|-------------|
| **SOAP Envelope** | The root element that defines the XML document as a SOAP message |
| **SOAP Header** | Optional metadata such as authentication, transactions, or routing |
| **SOAP Body** | The actual request or response payload |
| **SOAP Fault** | Standardized error reporting within the body |
| **WSDL** | Web Services Description Language -- describes the service contract |

## SOAP Message Structure

Every SOAP message follows the same XML envelope structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope
    xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
    xmlns:ws="http://example.com/webservice">

  <soap:Header>
    <ws:Authentication>
      <ws:Username>admin</ws:Username>
      <ws:Token>abc123</ws:Token>
    </ws:Authentication>
  </soap:Header>

  <soap:Body>
    <ws:GetUserRequest>
      <ws:UserId>42</ws:UserId>
    </ws:GetUserRequest>
  </soap:Body>

</soap:Envelope>
```

### Response

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope
    xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
    xmlns:ws="http://example.com/webservice">

  <soap:Body>
    <ws:GetUserResponse>
      <ws:User>
        <ws:Id>42</ws:Id>
        <ws:Name>Jane Doe</ws:Name>
        <ws:Email>jane@example.com</ws:Email>
      </ws:User>
    </ws:GetUserResponse>
  </soap:Body>

</soap:Envelope>
```

## WSDL (Web Services Description Language)

WSDL is an XML document that describes a SOAP web service -- its operations, message formats, and endpoint locations.

```xml
<definitions name="UserService"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://example.com/webservice">

  <types>
    <schema xmlns="http://www.w3.org/2001/XMLSchema">
      <element name="GetUserRequest">
        <complexType>
          <sequence>
            <element name="UserId" type="int"/>
          </sequence>
        </complexType>
      </element>
    </schema>
  </types>

  <message name="GetUserInput">
    <part name="parameters" element="tns:GetUserRequest"/>
  </message>

  <portType name="UserPortType">
    <operation name="GetUser">
      <input message="tns:GetUserInput"/>
      <output message="tns:GetUserOutput"/>
    </operation>
  </portType>

  <binding name="UserBinding" type="tns:UserPortType">
    <soap:binding style="document"
        transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetUser">
      <soap:operation soapAction="http://example.com/GetUser"/>
    </operation>
  </binding>

  <service name="UserService">
    <port name="UserPort" binding="tns:UserBinding">
      <soap:address location="http://api.example.com/soap/users"/>
    </port>
  </service>
</definitions>
```

## SOAP Fault (Error Handling)

```xml
<soap:Body>
  <soap:Fault>
    <soap:Code>
      <soap:Value>soap:Sender</soap:Value>
    </soap:Code>
    <soap:Reason>
      <soap:Text xml:lang="en">User not found</soap:Text>
    </soap:Reason>
    <soap:Detail>
      <ws:ErrorCode>404</ws:ErrorCode>
      <ws:Message>No user exists with ID 999</ws:Message>
    </soap:Detail>
  </soap:Fault>
</soap:Body>
```

## WS-Security

SOAP has built-in security extensions for enterprise use cases:

- **WS-Security**: Message-level security (encryption, signing, authentication tokens)
- **WS-Trust**: Token issuance and validation
- **WS-SecureConversation**: Secure session establishment
- **WS-Policy**: Declarative security requirements

This is a major advantage over REST, where security must be implemented at the transport layer (TLS) or with external standards (OAuth).

## SOAP vs REST

| Feature | SOAP | REST |
|---------|------|------|
| Protocol | Strict protocol with standards | Architectural style |
| Format | XML only | JSON, XML, YAML, etc. |
| Transport | HTTP, SMTP, TCP | HTTP |
| Contract | WSDL (formal, machine-readable) | OpenAPI / Swagger (optional) |
| State | Can be stateful or stateless | Stateless |
| Security | WS-Security (message-level) | TLS + OAuth (transport-level) |
| Performance | Heavier (XML parsing, overhead) | Lighter (JSON, less overhead) |
| Error handling | SOAP Fault (standardized) | HTTP status codes |
| Tooling | Strong code generation from WSDL | Flexible, manual integration |

## When to Use SOAP

- **Financial services**: Banks and payment processors often require SOAP for its ACID transaction support
- **Enterprise integration**: Legacy systems with existing WSDL contracts
- **Government and healthcare**: Regulatory requirements may mandate SOAP
- **Complex operations**: When you need formal contracts and built-in security
- **Existing infrastructure**: When integrating with systems that only expose SOAP interfaces

## Calling a SOAP Service (Node.js)

```javascript
const soap = require('soap');

const wsdlUrl = 'http://api.example.com/soap/users?wsdl';

soap.createClient(wsdlUrl, (err, client) => {
  if (err) throw err;

  client.GetUser({ UserId: 42 }, (err, result) => {
    if (err) throw err;
    console.log(result.User);
    // { Id: 42, Name: 'Jane Doe', Email: 'jane@example.com' }
  });
});
```

## Resources

- [W3C SOAP 1.2 Specification](https://www.w3.org/TR/soap12/)
- [WSDL 1.1 Specification](https://www.w3.org/TR/wsdl.html)
- [WS-Security Specification](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=wss)
- [node-soap Library](https://github.com/vpulim/node-soap)
- [SOAP vs REST - SmartBear](https://smartbear.com/blog/soap-vs-rest-whats-the-difference/)
