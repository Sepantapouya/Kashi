## FontBakery report

fontbakery version: 1.1.0







## Check results



<details><summary>[14] Kashi[wdth,wght].ttf</summary>
<div>
<details>
    <summary>⚠️ <b>WARN</b> Check mark characters are in GDEF mark glyph class. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/opentype.html#opentype-gdef-mark-chars">opentype/gdef_mark_chars</a></summary>
    <div>







* ⚠️ **WARN** <p>The following mark characters could be in the GDEF mark glyph class:
uni0658 (U+0658)</p>
 [code: mark-chars]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check accent of Lcaron, dcaron, lcaron, tcaron <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#alt-caron">alt_caron</a></summary>
    <div>









* ⚠️ **WARN** <p>Lcaron is decomposed and therefore could not be checked. Please check manually.</p>
 [code: decomposed-outline]



* ⚠️ **WARN** <p>dcaron is decomposed and therefore could not be checked. Please check manually.</p>
 [code: decomposed-outline]



* ⚠️ **WARN** <p>lcaron is decomposed and therefore could not be checked. Please check manually.</p>
 [code: decomposed-outline]



* ⚠️ **WARN** <p>tcaron is decomposed and therefore could not be checked. Please check manually.</p>
 [code: decomposed-outline]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check that glyph for U+0674 ARABIC LETTER HIGH HAMZA is not a mark. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#arabic-high-hamza">arabic_high_hamza</a></summary>
    <div>







* ⚠️ **WARN** <p>The arabic letter high hamza (U+0674) should have roughly the same size the arabic letter hamza (U+0621) while raised above baseline, but a different glyph outline area was detected.</p>
 [code: glyph-area]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Ensure files are not too large. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#file-size">file_size</a></summary>
    <div>







* ⚠️ **WARN** <p>Font file is 1.2Mb; ideally it should be less than 1.0Mb</p>
 [code: large-font]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Detect any interpolation issues in the font. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#interpolation-issues">interpolation_issues</a></summary>
    <div>







* ⚠️ **WARN** <p>Interpolation issues were found in the font:</p>
<pre><code>- Contour order differs in glyph 'uni06D0.medi.long': [0, 1, 2, 3] in wght=400,wdth=125, [0, 1, 3, 2] in wght=100,wdth=100.

- Contour order differs in glyph 'uni06D0.medi.long': [0, 1, 2, 3] in wght=100,wdth=100, [0, 1, 3, 2] in wght=900,wdth=100.

- Contour order differs in glyph 'uni06D0.medi.long': [0, 1, 2, 3] in wght=900,wdth=100, [0, 1, 3, 2] in wght=100,wdth=125.

- Contour order differs in glyph 'uni06D0.medi.long': [0, 1, 2, 3] in wght=100,wdth=125, [0, 1, 3, 2] in wght=900,wdth=125.

- Contour order differs in glyph 'uni06D0.medi.long.ss05': [0, 1, 2, 3] in wght=400,wdth=125, [0, 1, 3, 2] in wght=100,wdth=100.

- Contour order differs in glyph 'uni06D0.medi.long.ss05': [0, 1, 2, 3] in wght=100,wdth=100, [0, 1, 3, 2] in wght=900,wdth=100.

- Contour order differs in glyph 'uni06D0.medi.long.ss05': [0, 1, 2, 3] in wght=900,wdth=100, [0, 1, 3, 2] in wght=100,wdth=125.

- Contour order differs in glyph 'uni06D0.medi.long.ss05': [0, 1, 2, 3] in wght=100,wdth=125, [0, 1, 3, 2] in wght=900,wdth=125.

- Contour 0 start point differs in glyph 'uni066D' between location wght=400,wdth=125 and location wght=100,wdth=100

- Contour 0 in glyph 'uni066D': becomes underweight between wght=400,wdth=125 and wght=100,wdth=100.

- 90 more.
</code></pre>
<p>Use -F or --full-lists to disable shortening of long lists.</p>
 [code: interpolation-issues]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Are there caret positions declared for every ligature? <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#ligature-carets">ligature_carets</a></summary>
    <div>







* ⚠️ **WARN** <p>This font lacks caret position values for ligature glyphs on its GDEF table.</p>
 [code: lacks-caret-pos]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check math signs have the same width. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#math-signs-width">math_signs_width</a></summary>
    <div>







* ⚠️ **WARN** <p>The most common width is 1017 among a set of 2 math glyphs.
The following math glyphs have a different width, though:</p>
<p>Width = 1069:
plus</p>
<p>Width = 1093:
equal</p>
<p>Width = 1045:
greaterequal, greater</p>
<p>Width = 1106:
logicalnot</p>
<p>Width = 1068:
plusminus</p>
<p>Width = 998:
multiply</p>
<p>Width = 1134:
divide</p>
<p>Width = 929:
minus</p>
<p>Width = 1127:
approxequal</p>
<p>Width = 1098:
notequal</p>
 [code: width-outliers]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Does the font contain a soft hyphen? <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#soft-hyphen">soft_hyphen</a></summary>
    <div>







* ⚠️ **WARN** <p>This font has a 'Soft Hyphen' character.</p>
 [code: softhyphen]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Ensure Stylistic Sets have description. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#stylisticset-description">stylisticset_description</a></summary>
    <div>







* ⚠️ **WARN** <p>The stylistic set ss01 lacks a description string on the 'name' table.</p>
 [code: missing-description]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check font contains no unreachable glyphs <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#unreachable-glyphs">unreachable_glyphs</a></summary>
    <div>







* ⚠️ **WARN** <p>The following glyphs could not be reached by codepoint or substitution rules:</p>
<pre><code>- NameMe.65564

- NameMe.65565

- NameMe.65583

- NameMe.65703

- arabic_2dots

- arabic_3dots

- arabic_3dots_a

- arabic_dot

- arabic_gaf_bar

- commaaccent

- 13 more.
</code></pre>
<p>Use -F or --full-lists to disable shortening of long lists.</p>
 [code: unreachable-glyphs]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check for codepoints not covered by METADATA subsets. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/googlefonts.html#googlefonts-metadata-unreachable-subsetting">googlefonts/metadata/unreachable_subsetting</a></summary>
    <div>







* ⚠️ **WARN** <p>The following codepoints supported by the font are not covered by
any subsets defined in the font's metadata file, and will never
be served. You can solve this by either manually adding additional
subset declarations to METADATA.pb, or by editing the glyphset
definitions.</p>
<ul>
<li>U+02D8 BREVE: try adding one of: yi, canadian-aboriginal</li>
<li>U+02D9 DOT ABOVE: try adding one of: yi, canadian-aboriginal</li>
<li>U+02DB OGONEK: try adding one of: yi, canadian-aboriginal</li>
<li>U+0302 COMBINING CIRCUMFLEX ACCENT: try adding one of: cherokee, coptic, tifinagh, math</li>
<li>U+0306 COMBINING BREVE: try adding one of: old-permic, tifinagh</li>
<li>U+0307 COMBINING DOT ABOVE: try adding one of: tifinagh, duployan, canadian-aboriginal, tai-le, coptic, hebrew, todhri, old-permic, syriac, math, malayalam</li>
<li>U+030A COMBINING RING ABOVE: try adding one of: syriac, duployan</li>
<li>U+030B COMBINING DOUBLE ACUTE ACCENT: try adding one of: cherokee, osage</li>
<li>U+030C COMBINING CARON: try adding one of: cherokee, tai-le</li>
<li>U+030F COMBINING DOUBLE GRAVE ACCENT: not included in any glyphset definition
60 more.</li>
</ul>
<p>Use -F or --full-lists to disable shortening of long lists.</p>
<p>Or you can add the above codepoints to one of the subsets supported by the font: <code>arabic</code>, <code>latin</code>, <code>latin-ext</code>, <code>menu</code></p>
 [code: unreachable-subsetting]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check the direction of the outermost contour in each glyph <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/universal.html#outline-direction">outline_direction</a></summary>
    <div>







* ⚠️ **WARN** <p>The following glyphs have a counter-clockwise outer contour:</p>
<pre><code>* .notdef has a counter-clockwise outer contour

* A (U+0041) has a counter-clockwise outer contour

* A (U+0041) has a counter-clockwise outer contour

* A (U+0041) has a counter-clockwise outer contour

* A.smcp has a counter-clockwise outer contour

* A.smcp has a counter-clockwise outer contour

* A.smcp has a counter-clockwise outer contour

* A.unic has a counter-clockwise outer contour

* A.unic has a counter-clockwise outer contour

* AE (U+00C6) has a counter-clockwise outer contour

* 1941 more.
</code></pre>
<p>Use -F or --full-lists to disable shortening of long lists.</p>
 [code: ccw-outer-contour]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Checking OS/2 achVendID. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/googlefonts.html#googlefonts-vendor-id">googlefonts/vendor_id</a></summary>
    <div>







* ⚠️ **WARN** <p>OS/2 VendorID value 'KASH' is not yet recognized. If you registered it recently, then it's safe to ignore this warning message. Otherwise, you should set it to your own unique 4 character code, and register it with Microsoft at <a href="https://www.microsoft.com/typography/links/vendorlist.aspx">https://www.microsoft.com/typography/links/vendorlist.aspx</a></p>
 [code: unknown]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> Check font follows the Google Fonts vertical metric schema <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/googlefonts.html#googlefonts-vertical-metrics">googlefonts/vertical_metrics</a></summary>
    <div>







* ⚠️ **WARN** <p>We recommend the absolute sum of the hhea metrics should be between 1.2-1.5x of the font's upm. This font has 1.5625x (3200)</p>
 [code: bad-hhea-range]



</div>
</details>
</div>
</details>

<details><summary>[2] METADATA.pb</summary>
<div>
<details>
    <summary>🔥 <b>FAIL</b> DESCRIPTION.en_us.html must have more than 200 bytes. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/googlefonts.html#googlefonts-description-min-length">googlefonts/description/min_length</a></summary>
    <div>







* 🔥 **FAIL** <p>DESCRIPTION.en_us.html must have size larger than 200 bytes.</p>
 [code: too-short]



</div>
</details>

<details>
    <summary>⚠️ <b>WARN</b> DESCRIPTION.en_us.html should end in a linebreak. <a href="https://fontbakery.readthedocs.io/en/stable/fontbakery/checks/googlefonts.html#googlefonts-description-eof-linebreak">googlefonts/description/eof_linebreak</a></summary>
    <div>







* ⚠️ **WARN** <p>The last characther on DESCRIPTION.en_us.html is not a line-break. Please add it.</p>
 [code: missing-eof-linebreak]



</div>
</details>
</div>
</details>




### Summary

| 💥 ERROR | ☠ FATAL | 🔥 FAIL | ⚠️ WARN | ⏩ SKIP | ℹ️ INFO | ✅ PASS | 🔎 DEBUG | 
| ---|---|---|---|---|---|---|---|
| 0 | 0 | 1 | 15 | 46 | 8 | 168 | 0 | 
| 0% | 0% | 0% | 6% | 19% | 3% | 71% | 0% | 



**Note:** The following loglevels were omitted in this report:


* SKIP
* INFO
* PASS
* DEBUG
