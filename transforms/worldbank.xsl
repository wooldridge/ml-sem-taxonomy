<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ml="http://marklogic.com/poolparty/worldbank"
  xmlns:ex="http://example.org/"
  xmlns:xdmp="http://marklogic.com/xdmp"
  xmlns:map="http://marklogic.com/xdmp/map"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
>

<xdmp:import-module
  namespace="http://marklogic.com/semantics"
  href="/MarkLogic/semantics.xqy"/>

  <xsl:template match="/">

    <xsl:param name="id" select="ml:doc-envelope/ml:search-metadata/doc/@id"/>

    <envelope>

      <!-- sem:sparql('
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    prefix p0: <http://www.example.org/products/>
    prefix p2: <http://www.example.com/>

    SELECT ?product
    FROM <graph-1>
    WHERE
    {
      ?product rdf:type p2:shirt ;
      p2:color "blue"
    }',
    (),
    (),
    $rdfs-store
  )-->


      <sem:triples xmlns:sem="http://marklogic.com/semantics">

        <xsl:variable name="foo" select='"Gender"@en' />

        <xsl:for-each select="ml:doc-envelope/ml:annotations/ml:concepts/ml:concept">

          <xsl:copy-of select="
            sem:sparql('
            SELECT ?s
            WHERE
            {
              ?s ?prefLabel $foo
            }',
            map:new((
              map:entry(
                'prefLabel', sem:iri('http://www.w3.org/2004/02/skos/core#prefLabel'
              ),
              map:entry(
                'foo', xdmp:concat(''', 'Gender', ''', '@en')
              )
            ))
          )"/>

          <xsl:copy-of select="fn:concat('&quot;a', 'b')"/>

          <!--<sem:triple>
            <sem:subject>/<xsl:value-of select="$id"/></sem:subject>
            <sem:predicate>ex:hasConcept</sem:predicate>
            <sem:object><xsl:value-of select="translate(./text(), ' ', '_')"/></sem:object>
          </sem:triple>-->
        </xsl:for-each>

      </sem:triples>

      <xsl:copy-of select="ml:doc-envelope/ml:search-metadata"/>

      <xsl:copy-of select="ml:doc-envelope/ml:annotations"/>

      <xsl:copy-of select="ml:doc-envelope/ml:original-txt"/>

    </envelope>

  </xsl:template>

</xsl:stylesheet>
