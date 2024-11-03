---
layout: page
title: Natural Language Supervision for Sensor-Based HAR
description: Limitations in Employing Natural Language Supervision for Sensor-Based Human Activity Recognition--And Ways to Overcome Them
img: assets/img/12.jpg
importance: 1
category: work
related_publications: true
---

Arxiv link: [https://arxiv.org/pdf/2408.12023](https://arxiv.org/pdf/2408.12023).

## Abstract
Cross-modal contrastive pre-training between natural language and other modalities, e.g., vision and audio, has demonstrated astonishing performance and effectiveness across a diverse variety of tasks and domains. In this paper, we investigate whether such natural language supervision can be used for wearable sensor based Human Activity Recognition (HAR), and discover that-surprisingly-it performs substantially worse than standard end-to-end training and self-supervision. We identify the primary causes for this as: sensor heterogeneity and the lack of rich, diverse text descriptions of activities. To mitigate their impact, we also develop strategies and assess their effectiveness through an extensive experimental evaluation. These strategies lead to significant increases in activity recognition, bringing performance closer to supervised and self-supervised training, while also enabling the recognition of unseen activities and cross modal retrieval of videos. Overall, our work paves the way for better sensor-language learning, ultimately leading to the development of foundational models for HAR using wearables.

---

## Introduction
Learning joint embedding spaces by pairing modalities with natural language descriptions of their contents (e.g., image captions or sound descriptions for audio) has proven successful across modalities. 
<!-- Here, the task is to predict which description goes with which input, for large-scale datasets. -->
The expressiveness of natural language enables it to oversee a wider array of concepts, culminating in highly effective representations.

Despite the astonishing success of natural language supervision across modalities, domains, and applications, we discover and demonstrate in this paper that it is highly challenging to apply NLS in a plug-and-play manner to wearable sensor (accelerometer) based HAR.
Following standard cross-modal setups in computer vision, we first perform pre-training on the large-scale Capture-24 dataset and perform zero shot prediction of activities on six target datasets.
In the figure below, we see how the performance of self-supervised learning (SimCLR pre-training + MLP classifier) and end-to-end training (Conv. classifier) are **susbtantially better** than CLIP-style pre-training, outperforming by around 20-50%!.

<!-- For the performance drop image. The width controls how big the image looks like. `mx-auto d-block` centers the image in the page.  -->
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/publication_preview/nls_plot.png" title="example image" class="img-fluid rounded z-depth-1 mx-auto d-block"  width="40%" %}
    </div>
</div>
<!-- <div class="caption">
    Zero shot recognition of activities on six target datasets.
</div> -->

We discover two major reasons for this big drop in performance:
 - *Sensor heterogeneity*: Diversity in sensors results in significant differences in data distributions due to hardware constraints and settings such as gain, data and signal processing, differences in sampling rates – even if the sensor locations and activities are the same. This renders zero shot prediction very difficult, as pre-trained models cannot deal well with distributions causing substantial performance degradation when there is no opportunity for adaptation to (vastly) different test conditions.
 - *Lack of Rich Descriptions of Activities*: Learning such joint embedding spaces is data intensive, relying on diverse and unique text descriptions to learn wide ranging concepts. However, many HAR datasets contain only a handful of activity labels and (in some cases) demographics information – a far cry from the 400M image-text pairs in the original CLIP paper. 



Every project has a beautiful feature showcase page.
It's easy to include images in a flexible 3-column grid format.
Make your photos 1/3, 2/3, or full width.

To give your project a background in the portfolio page, just add the img tag to the front matter like so:

    ---
    layout: page
    title: project
    description: a project with a background image
    img: /assets/img/12.jpg
    ---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/1.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/3.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Caption photos easily. On the left, a road goes through a tunnel. Middle, leaves artistically fall in a hipster photoshoot. Right, in another hipster photoshoot, a lumberjack grasps a handful of pine needles.
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This image can also have a caption. It's like magic.
</div>

You can also put regular text between your rows of images, even citations {% cite einstein1950meaning %}.
Say you wanted to write a bit about your project before you posted the rest of the images.
You describe how you toiled, sweated, _bled_ for your project, and then... you reveal its glory in the next row of images.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    You can also have artistically styled 2/3 + 1/3 images, like these.
</div>

The code is simple.
Just wrap your images with `<div class="col-sm">` and place them inside `<div class="row">` (read more about the <a href="https://getbootstrap.com/docs/4.4/layout/grid/">Bootstrap Grid</a> system).
To make images responsive, add `img-fluid` class to each; for rounded corners and shadows use `rounded` and `z-depth-1` classes.
Here's the code for the last row of images above:

{% raw %}

```html
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-4 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
```

{% endraw %}
